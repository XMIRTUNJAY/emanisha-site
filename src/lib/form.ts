/**
 * Form submission client.
 *
 * Hostinger provides the domain and DNS only, and GitHub Pages has no
 * server-side runtime, so the form posts straight to Formspree, which mails
 * the site owner. No token is exposed to the browser and no third-party code
 * runs on the page.
 *
 * The endpoint is the one already configured for learn-marathi. Set
 * PUBLIC_FORM_ENDPOINT to override it; empty means the form reports that it
 * is not configured instead of failing silently.
 */

import { BOL_MARATHI_APP } from '../data/app';

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

const endpoint = (import.meta.env.PUBLIC_FORM_ENDPOINT ?? BOL_MARATHI_APP.waitlistFormAction ?? '').trim();

export const formConfigured = Boolean(endpoint);

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitForm(payload: FormPayload): Promise<SubmitResult> {
	if (!endpoint) {
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

	const labels = {
		contact: 'Contact message',
		newsletter: 'Newsletter signup',
		notify: 'Notify-me signup',
	};

	try {
		const res = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				email,
				name: payload.name ?? '',
				message: payload.message ?? '',
				// _subject and _reply_to are Formspree's built-in fields; the
				// reply goes to whoever wrote in.
				_subject: `[emanisha.in] ${labels[payload.kind]}${payload.source ? ` (${payload.source})` : ''}`,
				_reply_to: email,
				kind: payload.kind,
				source: payload.source ?? '',
			}),
		});
		if (!res.ok) {
			const detail = await res.json().catch(() => null);
			const message =
				detail?.errors?.[0]?.message ??
				detail?.message ??
				(res.status === 429
					? 'too many attempts — please try again later'
					: 'could not send right now');
			return { ok: false, error: message };
		}
		return { ok: true };
	} catch {
		return { ok: false, error: 'could not reach the form endpoint' };
	}
}
