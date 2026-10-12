// Sentence-scramble acceptance check — a submission is correct when it
// matches the canonical curriculum answer or one of the curated alternates.
// Pure functions (no DOM) — unit-tested directly.

export function isAccepted(
	item: { answer: string[]; alternates?: string[][] },
	tokens: string[]
): boolean {
	const eq = (a: string[]) =>
		a.length === tokens.length && a.every((t, i) => t === tokens[i]);
	return eq(item.answer) || (item.alternates ?? []).some(eq);
}
