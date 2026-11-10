/**
 * Form submission client.
 *
 * Hostinger provides the domain and DNS only, and GitHub Pages has no
 * server-side runtime, so submissions are sent to the GitHub API: each one
 * opens an issue in a private-purpose inbox repository. A GitHub Actions
 * workflow in that repo forwards the issue to the site owner's inbox by email
 * and then deletes it, so nothing accumulates.
 *
 * The token is injected at build time from PUBLIC_FORM_INBOX_TOKEN. It is
 * visible in the published JavaScript by necessity — it is therefore scoped to
 * a single repository with Issues: write and nothing else, and it is kept out
 * of git history.
 */

export type FormKind = 'contact' | 'newsletter' | 'notify';

export type FormPayload = {
	kind: FormKind;
	email: string;
	name?: string;
	message?: string;
	source?: string;
	/** Honeypot. Real readers never see it; bots fill it in. */
	website?: string;
};

const inboxRepo = import.meta.env.PUBLIC_FORM_INBOX_REPO ?? 'XMIRTUNJAY/emanisha-inbox';
const inboxToken = import.meta.env.PUBLIC_FORM_INBOX_TOKEN ?? '';

export const formConfigured = Boolean(inboxToken);

function endpoint(): string {
	return `https://api.github.com/repos/${inboxRepo}/issues`;
}

/** Marker the mail workflow looks for before forwarding anything. */
const MARKER = 'dhyaana-form-submission';

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitForm(payload: FormPayload): Promise<SubmitResult> {
	if (!inboxToken) {
		return { ok: false, error: 'the form is not configured yet' };
	}
	if (payload.website) {
		// Honeypot: pretend it worked so bots do not learn.
		return { ok: true };
	}
	const email = (payload.email ?? '').trim();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return { ok: false, error: 'please give a valid email address' };
	}
	if (payload.kind === 'contact' && ((payload.message ?? '').trim().length < 10 || !payload.name)) {
		return { ok: false, error: 'please add your name and a few words' };
	}

	const body = {
		...payload,
		submittedAt: new Date().toISOString(),
	};

	try {
		const res = await fetch(endpoint(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${inboxToken}`,
				'X-GitHub-Api-Version': '2022-11-28',
			},
			body: JSON.stringify({
				title: `${MARKER}: ${payload.kind}`,
				body: [
					MARKER,
					'',
					'```json',
					JSON.stringify(body, null, 2),
					'```',
				].join('\n'),
				labels: ['form-submission'],
			}),
		});
		if (!res.ok) {
			const detail = await res.json().catch(() => null);
			const message =
				detail?.message ??
				(res.status === 401 ? 'the form endpoint is not authorised' : 'delivery failed');
			return { ok: false, error: message };
		}
		return { ok: true };
	} catch {
		return { ok: false, error: 'could not reach the form endpoint' };
	}
}
