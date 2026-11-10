import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../dist/functions/api/contact.js';

/** Build a mock Pages Function request. */
const post = (body, contentType = 'application/json') => {
	const request = new Request('https://emanisha.in/api/contact', {
		method: 'POST',
		headers: { 'content-type': contentType },
		body: contentType === 'application/json' ? JSON.stringify(body) : new URLSearchParams(body),
	});
	return onRequest({ request });
};

test('form endpoint: rejects a bad email address', async () => {
	const res = await post({ kind: 'notify', email: 'not-an-email' });
	assert.equal(res.status, 400);
	const body = await res.json();
	assert.equal(body.ok, false);
});

test('form endpoint: accepts emails containing "a" and "d"', async () => {
	// The sanitiser once stripped the letters a/d along with the CR/LF
	// sequences, turning "a@b.co" into "@b.co".
	for (const email of ['a@b.co', 'dave@example.com', 'mrxubr@gmail.com', 'ada@web.io']) {
		const res = await post({ kind: 'notify', email, source: 'test' });
		// 503 means it validated and reached the (unconfigured) delivery step.
		assert.equal(res.status, 503, `${email} should validate, got ${res.status}`);
		const body = await res.json();
		assert.match(body.error, /not configured/i);
	}
});

test('form endpoint: rejects an unknown form kind', async () => {
	const res = await post({ kind: 'bogus', email: 'a@b.co' });
	assert.equal(res.status, 400);
});

test('form endpoint: contact requires a name and a message', async () => {
	const noMessage = await post({ kind: 'contact', email: 'a@b.co', name: 'X' });
	assert.equal(noMessage.status, 400);
	const noName = await post({ kind: 'contact', email: 'a@b.co', message: 'a long enough message' });
	assert.equal(noName.status, 400);
});

test('form endpoint: honeypot submissions are dropped silently', async () => {
	const res = await post({
		kind: 'contact',
		email: 'bot@spam.example',
		name: 'Bot',
		message: 'buy things',
		website: 'http://spam.example',
	});
	assert.equal(res.status, 200);
	const body = await res.json();
	assert.equal(body.ok, true);
});

test('form endpoint: GET is not allowed and OPTIONS answers the preflight', async () => {
	const get = await onRequest({
		request: new Request('https://emanisha.in/api/contact', { method: 'GET' }),
	});
	assert.equal(get.status, 405);

	const options = await onRequest({
		request: new Request('https://emanisha.in/api/contact', { method: 'OPTIONS' }),
	});
	assert.equal(options.status, 200);
	assert.equal(options.headers.get('access-control-allow-origin'), '*');
});

test('form endpoint: form-encoded submissions are accepted', async () => {
	const res = await post(
		{ kind: 'notify', email: 'a@b.co', source: 'test' },
		'application/x-www-form-urlencoded',
	);
	assert.equal(res.status, 503);
});
