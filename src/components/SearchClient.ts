// Search client-side logic - compiled by Vite, runs in browser

const SEARCH_URL = "/learn-marathi/search-index.json";
const MAX_RESULTS = 10;
const MIN_QUERY_LENGTH = 2;

let indexCache = null;
let indexPromise = null;

function normalize(value) {
	return String(value ?? "")
		.normalize("NFKC")
		.toLocaleLowerCase()
		.replace(/[\u200B-\u200D\uFEFF]/g, "")
		.replace(/[‐-‒–—―]/g, "-")
		.replace(/\s+/g, " ")
		.trim();
}

function tokenize(value) {
	return normalize(value)
		.replace(/[^\p{L}\p{N}\s-]/gu, " ")
		.split(/\s+/)
		.filter(Boolean);
}

function levenshtein(a, b) {
	if (a === b) return 0;
	if (!a) return b.length;
	if (!b) return a.length;

	if (a.length > b.length) {
		[a, b] = [b, a];
	}

	let previous = Array.from({ length: a.length + 1 }, (_, i) => i);

	for (let j = 1; j <= b.length; j++) {
		const current = [j];

		for (let i = 1; i <= a.length; i++) {
			const insertion = current[i - 1] + 1;
			const deletion = previous[i] + 1;
			const substitution = previous[i - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);

			current[i] = Math.min(insertion, deletion, substitution);
		}

		previous = current;
	}

	return previous[a.length];
}

function allowedDistance(term) {
	if (term.length <= 3) return 0;
	if (term.length <= 5) return 1;
	if (term.length <= 8) return 2;
	return 3;
}

function getSearchText(item) {
	return normalize([item.title, item.keywords, item.description, item.type].filter(Boolean).join(" "));
}

function scoreItem(query, item) {
	const q = normalize(query);

	const title = normalize(item.title);
	const keywords = normalize(item.keywords);
	const description = normalize(item.description);
	const type = normalize(item.type);

	if (!q || !title) return 0;

	let score = 0;

	if (title === q) score += 1000;
	if (title.startsWith(q)) score += 500;
	if (title.includes(q)) score += 350;
	if (keywords.includes(q)) score += 300;
	if (description.includes(q)) score += 100;

	const queryTokens = tokenize(q);
	const searchableTokens = tokenize(`${title} ${keywords} ${description}`);

	for (const queryToken of queryTokens) {
		if (!queryToken) continue;

		for (const token of searchableTokens) {
			if (token === queryToken) {
				score += 180;
				break;
			}

			if (token.startsWith(queryToken)) {
				score += 100;
				break;
			}

			const distance = allowedDistance(queryToken);

			if (
				distance > 0 &&
				Math.abs(token.length - queryToken.length) <= distance &&
				levenshtein(queryToken, token) <= distance
			) {
				score += 65;
				break;
			}
		}
	}

	if (type === "word") score += 15;
	if (type === "lesson") score += 10;

	return score;
}

function search(query) {
	if (!indexCache) return [];

	const q = normalize(query);

	if (q.length < MIN_QUERY_LENGTH) {
		return [];
	}

	return indexCache
		.map((item) => ({ ...item, score: scoreItem(q, item) }))
		.filter((item) => item.score > 0)
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return normalize(a.title).localeCompare(normalize(b.title), undefined, { sensitivity: "base" });
		})
		.slice(0, MAX_RESULTS);
}

async function loadSearchIndex() {
	if (indexCache) return indexCache;

	if (indexPromise) return indexPromise;

	indexPromise = fetch(SEARCH_URL, { headers: { Accept: "application/json" } })
		.then(async (response) => {
			if (!response.ok) throw new Error(`Search index returned ${response.status}`);
			const data = await response.json();
			if (!Array.isArray(data)) throw new Error("Invalid search index format");

			indexCache = data.filter(
				(item) =>
					item &&
					typeof item === "object" &&
					typeof item.title === "string" &&
					typeof item.url === "string"
			);
			return indexCache;
		})
		.finally(() => { indexPromise = null; });

	return indexPromise;
}

function escapeHtml(value) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function highlightMatch(text, query) {
	const safeText = escapeHtml(text);
	const safeQuery = escapeHtml(query.trim());

	if (!safeQuery) return safeText;

	const escapedRegex = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	try {
		return safeText.replace(new RegExp(`(${escapedRegex})`, "giu"), "<mark>$1</mark>");
	} catch {
		return safeText;
	}
}

function isSafeUrl(url) {
	try {
		const parsed = new URL(url, window.location.origin);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

function initializeSearch(root) {
	const input = root.querySelector("[data-search-input]");
	const results = root.querySelector("#search-results");
	const clearButton = root.querySelector("[data-search-clear]");
	const status = root.querySelector("[data-search-status]");

	if (!input || !results || !clearButton || !status) return;

	let highlightedIndex = -1;
	let currentResults = [];
	let searchTimer;

	function setOpen(open) {
		results.hidden = !open;
		input.setAttribute("aria-expanded", String(open));
		if (!open) {
			input.removeAttribute("aria-activedescendant");
			highlightedIndex = -1;
		}
	}

	function setStatus(message) { status.textContent = message; }

	function renderLoading() {
		results.innerHTML = '<li class="search-loading">Loading search…</li>';
		setOpen(true);
	}

	function renderEmpty(query) {
		results.innerHTML = `<li class="search-empty">No results for <strong>${escapeHtml(query)}</strong></li>`;
		setOpen(true);
	}

	function renderResults(items, query) {
		currentResults = items;
		highlightedIndex = -1;

		if (!items.length) {
			renderEmpty(query);
			setStatus("No search results");
			return;
		}

		results.innerHTML = items.map((item, index) => {
			const title = item.title || "Untitled";
			const type = item.type || "Result";
			const description = item.description || "";

			return `
				<li id="search-result-${index}" class="search-result-item" role="option" aria-selected="false" data-index="${index}" data-url="${escapeHtml(item.url)}">
					<div class="search-result-title">${highlightMatch(title, query)}</div>
					<div class="search-result-meta"><span class="search-result-type">${escapeHtml(type)}</span></div>
					${description ? `<div class="search-result-desc">${escapeHtml(description)}</div>` : ""}
				</li>
			`;
		}).join("");

		setStatus(`${items.length} result${items.length === 1 ? "" : "s"}`);
		setOpen(true);
	}

	function updateHighlight() {
		const items = results.querySelectorAll(".search-result-item");
		items.forEach((item, index) => {
			const active = index === highlightedIndex;
			item.classList.toggle("highlighted", active);
			item.setAttribute("aria-selected", String(active));
		});

		if (highlightedIndex >= 0) {
			const active = items[highlightedIndex];
			if (active) {
				input.setAttribute("aria-activedescendant", active.id);
				active.scrollIntoView({ block: "nearest" });
			}
		} else {
			input.removeAttribute("aria-activedescendant");
		}
	}

	function navigateTo(index) {
		const item = currentResults[index];
		if (!item?.url) return;
		if (!isSafeUrl(item.url)) return;
		window.location.href = item.url;
	}

	function performSearch(query) {
		const trimmed = query.trim();
		clearButton.hidden = trimmed.length === 0;

		if (trimmed.length < MIN_QUERY_LENGTH) {
			currentResults = [];
			setOpen(false);
			setStatus("");
			return;
		}

		const matches = search(trimmed);
		renderResults(matches, trimmed);
	}

	async function handleInput() {
		const query = input.value.trim();
		clearButton.hidden = query.length === 0;

		if (searchTimer) window.clearTimeout(searchTimer);

		if (query.length < MIN_QUERY_LENGTH) {
			currentResults = [];
			setOpen(false);
			setStatus("");
			return;
		}

		searchTimer = window.setTimeout(async () => {
			try {
				if (!indexCache) {
					renderLoading();
					await loadSearchIndex();
				}
				performSearch(query);
			} catch (error) {
				console.error("Search index failed to load:", error);
				results.innerHTML = '<li class="search-error">Search is temporarily unavailable.</li>';
				setOpen(true);
				setStatus("Search index could not be loaded");
			}
		}, 80);
	}

	input.addEventListener("input", handleInput);

	input.addEventListener("keydown", (event) => {
		const items = results.querySelectorAll(".search-result-item");
		if (!items.length) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			highlightedIndex = highlightedIndex < items.length - 1 ? highlightedIndex + 1 : 0;
			updateHighlight();
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			highlightedIndex = highlightedIndex > 0 ? highlightedIndex - 1 : items.length - 1;
			updateHighlight();
		} else if (event.key === "Enter") {
			if (highlightedIndex >= 0) {
				event.preventDefault();
				navigateTo(highlightedIndex);
			}
		} else if (event.key === "Escape") {
			event.preventDefault();
			setOpen(false);
		}
	});

	results.addEventListener("mousedown", (event) => {
		const item = event.target.closest(".search-result-item");
		if (!item) return;
		const index = Number(item.dataset.index);
		if (Number.isInteger(index)) navigateTo(index);
	});

	clearButton.addEventListener("click", () => {
		input.value = "";
		currentResults = [];
		highlightedIndex = -1;
		clearButton.hidden = true;
		setOpen(false);
		setStatus("");
		input.focus();
	});

	document.addEventListener("keydown", (event) => {
		const target = event.target;
		const isTyping = target?.matches?.("input, textarea, select, [contenteditable='true']");
		if (event.key === "/" && !isTyping && document.activeElement !== input) {
			event.preventDefault();
			input.focus();
		}
	});

	document.addEventListener("click", (event) => {
		if (!root.contains(event.target)) setOpen(false);
	});

	const preload = () => {
		loadSearchIndex().catch(() => {});
	};

	if ("requestIdleCallback" in window) {
		window.requestIdleCallback(preload);
	} else {
		window.setTimeout(preload, 1000);
	}
}

function bootSearch() {
	document.querySelectorAll("[data-search-root]").forEach((root) => {
		if (root.dataset.searchInitialized === "true") return;
		root.dataset.searchInitialized = "true";
		initializeSearch(root);
	});
}

bootSearch();
document.addEventListener("astro:page-load", bootSearch);

export { initializeSearch, bootSearch, loadSearchIndex, search };
