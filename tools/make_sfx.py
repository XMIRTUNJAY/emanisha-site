#!/usr/bin/env python3
"""Synthesize game feedback sound effects for a Marathi learning game
(sentence builder, word map, memory match) and encode them as MP3.

Usage: python3 make_sfx.py [output_dir]
Requires: numpy, ffmpeg (with libmp3lame) on PATH.
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else "audio"
WAV_TMP = os.path.join(OUT, "_wav")

# ---------- notes ----------
NOTE = {"C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00,
        "A4": 440.00, "B4": 493.88, "C5": 523.25, "D5": 587.33, "E5": 659.25,
        "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77, "C6": 1046.50,
        "E6": 1318.51, "G6": 1567.98, "A3": 220.00, "G3": 196.00, "E3": 164.81,
        "C3": 130.81, "D3": 146.83}


def t_arr(dur):
    return np.arange(int(SR * dur)) / SR


def env(n, attack=0.005, release=0.08, decay=None):
    """Attack/release envelope, optional exponential decay."""
    e = np.ones(n)
    a = min(n, max(1, int(SR * attack)))
    r = min(n, max(1, int(SR * release)))
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    if decay:
        e *= np.exp(-np.arange(n) / SR * decay)
    return e


def tone(freq, dur, kind="sine", vol=0.5, attack=0.005, release=0.08, decay=None):
    t = t_arr(dur)
    if kind == "sine":
        w = np.sin(2 * np.pi * freq * t)
    elif kind == "bell":  # soft bell: fundamental + inharmonic partials
        w = (np.sin(2 * np.pi * freq * t)
             + 0.5 * np.sin(2 * np.pi * freq * 2.76 * t)
             + 0.25 * np.sin(2 * np.pi * freq * 5.4 * t))
        w /= 1.75
    elif kind == "soft":  # warm: sine + gentle overtones
        w = (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * 2 * freq * t)
             + 0.1 * np.sin(2 * np.pi * 3 * freq * t)) / 1.4
    elif kind == "square":
        w = np.sign(np.sin(2 * np.pi * freq * t)) * 0.6
        w = np.convolve(w, np.ones(8) / 8, mode="same")  # tame the edge
    elif kind == "saw":
        w = 2 * ((freq * t) % 1) - 1
        w = np.convolve(w, np.ones(6) / 6, mode="same")
    else:
        raise ValueError(kind)
    return w * env(len(t), attack, release, decay) * vol


def sweep(f0, f1, dur, vol=0.5, kind="sine", release=0.03):
    t = t_arr(dur)
    f = np.linspace(f0, f1, len(t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    w = np.sin(ph) if kind == "sine" else np.sign(np.sin(ph)) * 0.5
    return w * env(len(t), 0.004, release) * vol


def noise(dur, vol=0.3, lp=None, decay=None):
    rng = np.random.default_rng(7)
    n = rng.standard_normal(int(SR * dur))
    if lp:  # crude one-pole low-pass
        a = np.exp(-2 * np.pi * lp / SR)
        out = np.zeros_like(n)
        for i in range(1, len(n)):
            out[i] = (1 - a) * n[i] + a * out[i - 1]
        n = out / (np.max(np.abs(out)) + 1e-9)
    return n * env(len(n), 0.002, 0.05, decay) * vol


def seq(parts, gap=0.0):
    """Concatenate [(array)] with optional gap seconds."""
    g = np.zeros(int(SR * gap))
    out = []
    for p in parts:
        out.append(p)
        out.append(g)
    return np.concatenate(out)


def mix(*layers, offsets=None):
    offsets = offsets or [0.0] * len(layers)
    n = max(int(SR * o) + len(l) for l, o in zip(layers, offsets))
    out = np.zeros(n)
    for l, o in zip(layers, offsets):
        s = int(SR * o)
        out[s:s + len(l)] += l
    return out


def arp(names, step, dur, kind="bell", vol=0.45, decay=5):
    layers, offs = [], []
    for i, nm in enumerate(names):
        layers.append(tone(NOTE[nm], dur, kind, vol, decay=decay))
        offs.append(i * step)
    return mix(*layers, offsets=offs)


def chord(names, dur, kind="soft", vol=0.3, decay=3):
    return mix(*[tone(NOTE[n], dur, kind, vol, decay=decay) for n in names])


def reverb(x, amount=0.25, delay=0.045, taps=4):
    out = np.concatenate([x, np.zeros(int(SR * delay * taps) + 1)])
    for k in range(1, taps + 1):
        d = int(SR * delay * k)
        out[d:d + len(x)] += x * (amount ** k)
    return out


# ---------- sound definitions ----------
SOUNDS = {}


def sfx(category, name, desc):
    def deco(fn):
        SOUNDS[name] = (category, desc, fn)
        return fn
    return deco


# ===== UI / shared =====
@sfx("ui", "click", "Generic button tap")
def _():
    return mix(tone(1200, 0.05, "sine", 0.4, release=0.03, decay=60),
               noise(0.015, 0.15, lp=4000, decay=200))


@sfx("ui", "click_soft", "Gentle tap for menu items")
def _():
    return tone(700, 0.07, "soft", 0.35, release=0.05, decay=40)


@sfx("ui", "back", "Back / cancel navigation")
def _():
    return seq([tone(NOTE["E5"], 0.07, "soft", 0.35, decay=20),
                tone(NOTE["C5"], 0.1, "soft", 0.35, decay=15)])


@sfx("ui", "toggle_on", "Setting switched on")
def _():
    return seq([tone(NOTE["C5"], 0.06, "soft", 0.35), tone(NOTE["G5"], 0.09, "soft", 0.35, decay=12)])


@sfx("ui", "toggle_off", "Setting switched off")
def _():
    return seq([tone(NOTE["G5"], 0.06, "soft", 0.35), tone(NOTE["C5"], 0.09, "soft", 0.35, decay=12)])


@sfx("ui", "whoosh", "Screen / card transition")
def _():
    n = noise(0.35, 0.5, lp=2500)
    swell = np.sin(np.linspace(0, np.pi, len(n))) ** 2
    return n * swell


@sfx("ui", "pop", "Small element appearing")
def _():
    return sweep(300, 900, 0.09, 0.5, release=0.04) * np.exp(-t_arr(0.09) * 15)


@sfx("ui", "game_start", "Round begins")
def _():
    return arp(["C5", "E5", "G5", "C6"], 0.09, 0.4, "bell", 0.4, decay=6)


@sfx("ui", "countdown_beep", "3-2-1 countdown beep")
def _():
    return tone(880, 0.15, "sine", 0.5, release=0.05)


@sfx("ui", "countdown_go", "Countdown GO beep")
def _():
    return tone(1320, 0.4, "sine", 0.55, release=0.15)


@sfx("ui", "notification", "Reminder / daily practice nudge")
def _():
    return reverb(seq([tone(NOTE["E5"], 0.12, "bell", 0.4, decay=8),
                       tone(NOTE["B5"], 0.3, "bell", 0.4, decay=7)]), 0.3)


# ===== feedback (all games) =====
@sfx("feedback", "correct", "Correct answer")
def _():
    return reverb(arp(["E5", "G5", "C6"], 0.07, 0.45, "bell", 0.45, decay=6), 0.25)


@sfx("feedback", "correct_soft", "Quiet correct answer (low-stimulus mode)")
def _():
    return tone(NOTE["G5"], 0.3, "bell", 0.35, decay=8)


@sfx("feedback", "incorrect", "Wrong answer (gentle, not harsh)")
def _():
    return seq([tone(NOTE["E4"], 0.14, "soft", 0.45, decay=4),
                tone(NOTE["C4"], 0.28, "soft", 0.45, decay=4)])


@sfx("feedback", "incorrect_buzz", "Wrong answer (buzzer variant)")
def _():
    return tone(150, 0.3, "saw", 0.4, release=0.08)


@sfx("feedback", "try_again", "Encouraging nudge after a miss")
def _():
    return seq([tone(NOTE["D5"], 0.1, "soft", 0.4, decay=10),
                tone(NOTE["F5"], 0.1, "soft", 0.4, decay=10),
                tone(NOTE["A5"], 0.22, "soft", 0.4, decay=8)])


@sfx("feedback", "almost", "Close but not quite")
def _():
    return seq([tone(NOTE["G5"], 0.12, "bell", 0.4, decay=8),
                tone(NOTE["F5"], 0.25, "bell", 0.4, decay=7)])


@sfx("feedback", "hint", "Hint revealed")
def _():
    return reverb(seq([tone(NOTE["A5"], 0.1, "bell", 0.35, decay=9),
                       tone(NOTE["E6"], 0.25, "bell", 0.35, decay=8)]), 0.3)


@sfx("feedback", "skip", "Question skipped")
def _():
    return sweep(900, 400, 0.18, 0.4)


# ===== streak / combo =====
for i, top in enumerate(["C5", "D5", "E5", "G5", "A5", "C6"], start=1):
    def _make(i=i, top=top):
        base = ["C5", "E5", "G5", "A5", "B5", "C6", "E6"][: i + 1]
        return reverb(arp(base[-3:] if i > 2 else base, 0.06, 0.4, "bell", 0.42, decay=6), 0.25)
    SOUNDS[f"streak_{i}"] = ("streak", f"Correct-answer streak level {i}", _make)


@sfx("streak", "streak_lost", "Streak broken")
def _():
    return seq([tone(NOTE["A4"], 0.1, "soft", 0.4), tone(NOTE["F4"], 0.1, "soft", 0.4),
                tone(NOTE["D4"], 0.25, "soft", 0.4, decay=4)])


@sfx("streak", "combo_x2", "Combo multiplier x2")
def _():
    return arp(["G5", "C6"], 0.06, 0.25, "bell", 0.4, decay=8)


@sfx("streak", "combo_x3", "Combo multiplier x3")
def _():
    return arp(["E5", "G5", "C6"], 0.05, 0.3, "bell", 0.4, decay=7)


@sfx("streak", "combo_x5", "Combo multiplier x5")
def _():
    return reverb(arp(["C5", "E5", "G5", "C6", "E6"], 0.045, 0.35, "bell", 0.4, decay=6), 0.3)


# ===== rewards =====
@sfx("reward", "coin", "Coin / point earned")
def _():
    return seq([tone(NOTE["B5"], 0.07, "square", 0.25, decay=10),
                tone(NOTE["E6"], 0.25, "square", 0.25, decay=8)])


@sfx("reward", "star_1", "One star earned")
def _():
    return reverb(tone(NOTE["E6"], 0.5, "bell", 0.45, decay=5), 0.3)


@sfx("reward", "star_2", "Second star earned")
def _():
    return reverb(arp(["E6", "G6"], 0.18, 0.5, "bell", 0.45, decay=5), 0.3)


@sfx("reward", "star_3", "Third star earned")
def _():
    return reverb(arp(["E6", "G6", "C6"], 0.0, 0.0001) if False else
                  arp(["G5", "C6", "E6", "G6"], 0.12, 0.6, "bell", 0.45, decay=4), 0.3)


@sfx("reward", "badge_unlock", "Badge / achievement unlocked")
def _():
    return reverb(mix(arp(["C5", "E5", "G5", "C6", "E6", "G6"], 0.07, 0.7, "bell", 0.4, decay=4),
                      chord(["C5", "G5", "E6"], 1.0, "soft", 0.15, decay=2), offsets=[0, 0.4]), 0.3)


@sfx("reward", "level_up", "Level up")
def _():
    return reverb(mix(arp(["C5", "D5", "E5", "G5", "C6"], 0.08, 0.5, "bell", 0.4, decay=5),
                      chord(["C5", "E5", "G5", "C6"], 0.9, "soft", 0.2, decay=3),
                      offsets=[0, 0.4]), 0.3)


@sfx("reward", "new_high_score", "New high score")
def _():
    return reverb(seq([arp(["G5", "C6", "E6"], 0.07, 0.35, "bell", 0.42, decay=6),
                       arp(["A5", "D5", "G6"], 0.07, 0.35, "bell", 0.42, decay=6),
                       chord(["C5", "E5", "G5", "C6"], 0.8, "bell", 0.28, decay=3)]), 0.3)


@sfx("reward", "daily_goal", "Daily goal reached")
def _():
    return reverb(arp(["E5", "G5", "B5", "E6"], 0.1, 0.7, "bell", 0.4, decay=4), 0.3)


# ===== fanfares =====
@sfx("fanfare", "round_complete", "Round / level finished")
def _():
    return reverb(seq([arp(["C5", "E5", "G5"], 0.09, 0.3, "bell", 0.42, decay=6),
                       chord(["C5", "E5", "G5", "C6"], 0.9, "bell", 0.3, decay=3)]), 0.3)


@sfx("fanfare", "perfect_score", "100% / flawless round")
def _():
    run = arp(["C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6", "E6", "G6"], 0.055, 0.35,
              "bell", 0.38, decay=6)
    fin = chord(["C5", "E5", "G5", "C6", "E6"], 1.4, "bell", 0.28, decay=2.5)
    return reverb(mix(run, fin, offsets=[0, 0.5]), 0.35)


@sfx("fanfare", "game_complete", "Whole game / unit finished")
def _():
    a = chord(["C4", "E4", "G4"], 0.3, "soft", 0.3, decay=2)
    b = chord(["F4", "A4", "C5"], 0.3, "soft", 0.3, decay=2)
    c = chord(["G4", "B4", "D5"], 0.3, "soft", 0.3, decay=2)
    d = chord(["C5", "E5", "G5", "C6"], 1.4, "bell", 0.3, decay=2)
    return reverb(seq([a, b, c, d]), 0.3)


@sfx("fanfare", "game_over", "Out of lives / time (soft, not punishing)")
def _():
    return seq([tone(NOTE["G4"], 0.18, "soft", 0.4, decay=3), tone(NOTE["E4"], 0.18, "soft", 0.4, decay=3),
                tone(NOTE["C4"], 0.18, "soft", 0.4, decay=3), tone(NOTE["G3"], 0.5, "soft", 0.4, decay=3)])


# ===== timer / lives =====
@sfx("timer", "tick", "Timer tick")
def _():
    return mix(tone(1800, 0.03, "sine", 0.3, release=0.02, decay=80))


@sfx("timer", "tick_fast", "Last-seconds tick")
def _():
    return tone(2200, 0.04, "sine", 0.4, release=0.02, decay=60)


@sfx("timer", "time_warning", "10 seconds left")
def _():
    return seq([tone(988, 0.1, "sine", 0.45), tone(988, 0.1, "sine", 0.45)], gap=0.06)


@sfx("timer", "time_up", "Timer expired")
def _():
    return seq([tone(NOTE["A4"], 0.18, "soft", 0.45, decay=3), tone(NOTE["E4"], 0.4, "soft", 0.45, decay=3)])


@sfx("timer", "life_lost", "Heart lost")
def _():
    return mix(sweep(600, 150, 0.3, 0.45), noise(0.08, 0.15, lp=1500, decay=30))


@sfx("timer", "life_gained", "Heart gained")
def _():
    return arp(["E5", "A5", "E6"], 0.07, 0.3, "bell", 0.4, decay=7)


# ===== sentence builder =====
@sfx("sentence_builder", "word_pick", "Word tile picked up")
def _():
    return mix(tone(520, 0.07, "soft", 0.4, decay=25), noise(0.02, 0.1, lp=3000, decay=150))


@sfx("sentence_builder", "word_place", "Word tile dropped into the sentence")
def _():
    return mix(tone(330, 0.1, "soft", 0.5, decay=30), noise(0.03, 0.2, lp=1800, decay=100))


@sfx("sentence_builder", "word_remove", "Word tile returned to the bank")
def _():
    return mix(tone(420, 0.08, "soft", 0.4, decay=25), sweep(500, 300, 0.07, 0.15))


@sfx("sentence_builder", "word_snap", "Tile snaps into the correct slot")
def _():
    return seq([mix(tone(660, 0.05, "sine", 0.4, decay=50), noise(0.015, 0.2, lp=3500, decay=200)),
                tone(990, 0.12, "bell", 0.35, decay=12)])


@sfx("sentence_builder", "word_wrong_slot", "Tile rejected from a slot")
def _():
    return seq([tone(220, 0.08, "square", 0.25, decay=15), tone(185, 0.12, "square", 0.25, decay=12)])


@sfx("sentence_builder", "sentence_correct", "Complete sentence is correct")
def _():
    return reverb(seq([arp(["C5", "E5", "G5", "C6"], 0.07, 0.35, "bell", 0.42, decay=6),
                       chord(["C5", "G5", "E6"], 0.6, "bell", 0.25, decay=3)]), 0.3)


@sfx("sentence_builder", "sentence_wrong", "Complete sentence is incorrect")
def _():
    return seq([tone(NOTE["D4"], 0.15, "soft", 0.45, decay=4), tone(NOTE["A3"], 0.35, "soft", 0.45, decay=4)])


@sfx("sentence_builder", "sentence_check", "Check button pressed")
def _():
    return seq([tone(NOTE["G5"], 0.06, "soft", 0.35), tone(NOTE["C6"], 0.06, "soft", 0.35)])


@sfx("sentence_builder", "word_order_swap", "Two words swap places")
def _():
    return mix(sweep(400, 700, 0.1, 0.3), sweep(700, 400, 0.1, 0.3))


# ===== word map (matching words to meanings / locations on a map) =====
@sfx("word_map", "node_select", "Map node selected")
def _():
    return mix(tone(NOTE["A5"], 0.12, "bell", 0.35, decay=12), tone(NOTE["E5"], 0.12, "bell", 0.25, decay=12))


@sfx("word_map", "node_connect", "Two nodes linked by a line")
def _():
    return seq([sweep(500, 900, 0.1, 0.3), tone(NOTE["C6"], 0.15, "bell", 0.35, decay=10)])


@sfx("word_map", "node_disconnect", "Link removed")
def _():
    return sweep(900, 400, 0.12, 0.3)


@sfx("word_map", "pair_correct", "Word-meaning pair is correct")
def _():
    return reverb(arp(["G5", "C6", "E6"], 0.06, 0.4, "bell", 0.42, decay=6), 0.25)


@sfx("word_map", "pair_wrong", "Word-meaning pair is wrong")
def _():
    return seq([tone(NOTE["E4"], 0.12, "soft", 0.42, decay=5), tone(NOTE["B3"] if "B3" in NOTE else 246.94,
                                                                    0.25, "soft", 0.42, decay=4)])


@sfx("word_map", "region_unlock", "New map region unlocked")
def _():
    return reverb(mix(sweep(300, 1200, 0.35, 0.25),
                      arp(["C5", "G5", "C6", "E6"], 0.08, 0.5, "bell", 0.38, decay=5),
                      offsets=[0, 0.2]), 0.3)


@sfx("word_map", "region_complete", "Map region fully learned")
def _():
    return reverb(seq([arp(["E5", "G5", "C6"], 0.07, 0.3, "bell", 0.4, decay=6),
                       chord(["C5", "E5", "G5", "C6"], 0.8, "bell", 0.28, decay=3)]), 0.3)


@sfx("word_map", "path_step", "Marker moves one step along the map")
def _():
    return mix(tone(480, 0.06, "soft", 0.35, decay=30), noise(0.015, 0.1, lp=2500, decay=150))


@sfx("word_map", "map_reveal", "Map piece revealed")
def _():
    return reverb(mix(noise(0.3, 0.2, lp=5000), tone(NOTE["G5"], 0.5, "bell", 0.3, decay=5)), 0.3)


# ===== memory match =====
@sfx("memory_match", "card_flip", "Card flipped face-up")
def _():
    return mix(noise(0.06, 0.4, lp=3500, decay=60), tone(900, 0.04, "sine", 0.2, release=0.03, decay=60))


@sfx("memory_match", "card_flip_back", "Card flipped face-down")
def _():
    return mix(noise(0.06, 0.35, lp=2500, decay=60), tone(600, 0.04, "sine", 0.2, release=0.03, decay=60))


@sfx("memory_match", "card_match", "Matching pair found")
def _():
    return reverb(arp(["E5", "G5", "C6"], 0.07, 0.45, "bell", 0.45, decay=6), 0.25)


@sfx("memory_match", "card_mismatch", "Cards do not match")
def _():
    return seq([tone(NOTE["E4"], 0.1, "soft", 0.4, decay=5), tone(NOTE["D4"], 0.18, "soft", 0.4, decay=4)])


@sfx("memory_match", "card_shuffle", "Deck shuffled at start")
def _():
    rng = np.random.default_rng(3)
    parts = []
    for _ in range(9):
        parts.append(noise(0.05, 0.3, lp=int(rng.integers(1800, 4200)), decay=60))
        parts.append(np.zeros(int(SR * 0.025)))
    return np.concatenate(parts)


@sfx("memory_match", "card_deal", "Card dealt onto the board")
def _():
    return mix(noise(0.05, 0.35, lp=3000, decay=70), tone(380, 0.05, "soft", 0.2, decay=40))


@sfx("memory_match", "pair_vanish", "Matched pair clears from the board")
def _():
    return reverb(mix(sweep(800, 1600, 0.2, 0.25), tone(NOTE["C6"], 0.35, "bell", 0.3, decay=7)), 0.25)


@sfx("memory_match", "board_clear", "Every pair matched")
def _():
    run = arp(["C5", "E5", "G5", "C6", "E6", "G6"], 0.07, 0.4, "bell", 0.4, decay=5)
    return reverb(mix(run, chord(["C5", "E5", "G5", "C6"], 1.0, "bell", 0.28, decay=3), offsets=[0, 0.45]), 0.3)


@sfx("memory_match", "last_pair", "One pair remaining")
def _():
    return seq([tone(NOTE["G5"], 0.08, "bell", 0.35, decay=10), tone(NOTE["G5"], 0.08, "bell", 0.35, decay=10),
                tone(NOTE["C6"], 0.2, "bell", 0.38, decay=8)], gap=0.04)


# ---------- render ----------
def normalize(x, peak=0.89):
    m = np.max(np.abs(x))
    return x / m * peak if m > 0 else x


def fade(x, ms=6):
    n = int(SR * ms / 1000)
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    os.makedirs(WAV_TMP, exist_ok=True)
    manifest = []
    for name, (cat, desc, fn) in SOUNDS.items():
        x = fade(normalize(fn()))
        cat_dir = os.path.join(OUT, cat)
        os.makedirs(cat_dir, exist_ok=True)
        wav = os.path.join(WAV_TMP, f"{name}.wav")
        mp3 = os.path.join(cat_dir, f"{name}.mp3")
        write_wav(wav, x)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-codec:a", "libmp3lame",
                        "-b:a", "128k", "-ar", str(SR), "-ac", "1", mp3], check=True)
        manifest.append({"id": name, "category": cat, "file": f"{cat}/{name}.mp3",
                         "duration_s": round(len(x) / SR, 2), "description": desc})
    for f in os.listdir(WAV_TMP):
        os.remove(os.path.join(WAV_TMP, f))
    os.rmdir(WAV_TMP)
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(manifest)} MP3s to {OUT}/")


if __name__ == "__main__":
    main()
