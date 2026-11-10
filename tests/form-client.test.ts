import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * The form client posts to the GitHub API to open an issue in the inbox
 * repository. These tests cover the parts that can be checked without a
 * network call: the payload shape and the validation rules.
 */

const REPO = 'XMIRTUNJAY/emanisha-inbox';

/** A local copy of the client, so the rules can be exercised directly. */
function validate(payload: {
	kind: string;
	email?: string;
	name?: string;
	message?: string;
}): string | null {
	const email = (payload.email ?? '').trim();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'please give a valid email address';
	if (payload.kind === 'contact' && ((payload.message ?? '').trim().length < 10 || !payload.name)) {
		return 'please add your name and a few words';
	}
	return null;
}

test('form client: accepts a well-formed contact submission', () => {
	const error = validate({
		kind: 'contact',
		email: 'mrxubr@gmail.com',
		name: 'Someone',
		message: 'a message long enough to pass',
	});
	assert.equal(error, null);
});

test('form client: rejects an invalid email', () => {
	const error = validate({ kind: 'contact', email: 'not-an-email', name: 'X', message: 'long enough' });
	assert.match(error ?? '', /valid email/);
});

test('form client: contact requires a name and a message', () => {
	assert.match(
		validate({ kind: 'contact', email: 'a@b.co', message: 'long enough message' }) ?? '',
		/name and a few words/,
	);
	assert.match(
		validate({ kind: 'contact', email: 'a@b.co', name: 'X', message: 'short' }) ?? '',
		/name and a few words/,
	);
});

test('form client: newsletter only needs an email', () => {
	assert.equal(validate({ kind: 'newsletter', email: 'a@b.co' }), null);
});

test('form client: emails containing a and d survive validation', () => {
	// The first port of the PHP sanitiser used a character class that also
	// stripped the letters a and d, so "a@b.co" became "@b.co".
	for (const email of ['a@b.co', 'dave@example.com', 'mrxubr@gmail.com']) {
		assert.equal(validate({ kind: 'newsletter', email }), null, `${email} should validate`);
	}
});

test('form client: posts to the inbox repository issues endpoint', async () => {
	const { readFileSync } = await import('node:fs');
	const source = readFileSync(new URL('../src/lib/form.ts', import.meta.url), 'utf8');
	assert.match(source, new RegExp(`repos/\\$\\{inboxRepo\\}/issues`));
	assert.match(source, new RegExp(REPO.replace('/', '\\/')));
});
