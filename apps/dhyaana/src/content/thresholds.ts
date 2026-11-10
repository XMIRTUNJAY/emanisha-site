/**
 * Completion rules for short-form video.
 *
 * The library is short-form: 78 of 84 clips are exactly 10 seconds, and the
 * longest is 31. A fixed "5 seconds watched" floor therefore meant half of a
 * typical clip, and a clip abandoned early was never credited at all.
 *
 * The rules here are proportional to the clip length instead:
 *   - credit (partial progress is remembered) once a meaningful fraction has
 *     been watched
 *   - completion once most of the clip has been watched
 *
 * Both are floored so that very short clips still behave sensibly.
 */

/** Fraction of a clip that counts as meaningful partial progress. */
export const PARTIAL_FRACTION = 0.4;

/** Fraction of a clip that counts as completed. */
export const COMPLETE_FRACTION = 0.9;

/** Never credit less than this many seconds, however short the clip is. */
export const PARTIAL_MIN_SECONDS = 3;

/** Never demand more than this many seconds to complete a clip. */
export const COMPLETE_MAX_SECONDS = 8;

/** Fallback completion threshold when the clip length is unknown. */
export const COMPLETE_MIN_SECONDS = 3;

/** Seconds of a clip that count as meaningful partial progress. */
export function partialThreshold(duration: number): number {
	if (!duration || duration <= 0) return PARTIAL_MIN_SECONDS;
	return Math.min(
		Math.max(PARTIAL_MIN_SECONDS, Math.ceil(duration * PARTIAL_FRACTION)),
		Math.max(PARTIAL_MIN_SECONDS, duration - 1),
	);
}

/** Seconds of a clip that count as completed. */
export function completeThreshold(duration: number): number {
	if (!duration || duration <= 0) return COMPLETE_MIN_SECONDS;
	return Math.min(
		Math.max(1, Math.ceil(duration * COMPLETE_FRACTION)),
		Math.max(1, duration),
	);
}

/** Whether a clip that has been watched this long should be remembered. */
export function earnsPartialCredit(secondsWatched: number, duration: number): boolean {
	return secondsWatched >= partialThreshold(duration);
}

/** Whether a clip that has been watched this long counts as completed. */
export function isComplete(secondsWatched: number, duration: number): boolean {
	if (!duration || duration <= 0) return false;
	return secondsWatched >= completeThreshold(duration) || secondsWatched / duration >= COMPLETE_FRACTION;
}
