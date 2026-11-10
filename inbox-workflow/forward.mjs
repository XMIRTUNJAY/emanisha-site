// Forward a form submission (encoded as a JSON block in the issue body) to the
// site owner's inbox, then delete the issue so the inbox stays empty.
//
// Runs inside GitHub Actions; credentials come from repository secrets.

import nodemailer from 'nodemailer';
import { execFileSync } from 'node:child_process';

const marker = 'dhyaana-form-submission';
const body = process.env.ISSUE_BODY ?? '';
const title = process.env.ISSUE_TITLE ?? '';
const issueNumber = process.env.ISSUE_NUMBER ?? '';
const mailTo = process.env.MAIL_TO ?? 'mrxubr@gmail.com';

const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER ?? '';
const pass = process.env.SMTP_PASS ?? '';

if (!user || !pass) {
  console.error('SMTP_USER / SMTP_PASS are not set — cannot send mail.');
  process.exit(1);
}

/** Pull the JSON payload out of the issue body. */
function parsePayload(text) {
  const start = text.indexOf('```json');
  if (start === -1) return null;
  const from = start + '```json'.length;
  const end = text.indexOf('```', from);
  if (end === -1) return null;
  try {
    return JSON.parse(text.slice(from, end).trim());
  } catch {
    return null;
  }
}

const payload = parsePayload(body);
if (!payload) {
  console.error('Issue body did not contain a parsable payload.');
  process.exit(1);
}

const labels = {
  contact: 'Contact message',
  newsletter: 'Newsletter signup',
  notify: 'Notify-me signup',
};

const kind = String(payload.kind ?? 'contact');
const subject = `[emanisha.in] ${labels[kind] ?? kind}${payload.source ? ` (${payload.source})` : ''}`;

const lines = [
  `Kind: ${labels[kind] ?? kind}`,
  payload.source ? `Source: ${payload.source}` : '',
  payload.name ? `Name: ${payload.name}` : '',
  `Email: ${payload.email}`,
  '',
  payload.message ?? '',
  '',
  `Submitted: ${payload.submittedAt ?? new Date().toISOString()}`,
  `Issue: ${issueNumber}`,
].filter((line) => line !== '');

const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

try {
  await transport.sendMail({
    from: `"eManisha site" <${user}>`,
    to: mailTo,
    replyTo: payload.email || undefined,
    subject,
    text: lines.join('\n'),
  });
  console.log(`Forwarded "${kind}" submission to ${mailTo}.`);
} catch (error) {
  console.error('Failed to send mail:', error?.message ?? error);
  process.exit(1);
}

// Remove the issue so nothing accumulates in the inbox.
try {
  execFileSync('gh', ['issue', 'delete', String(issueNumber), '--yes'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      GH_TOKEN: process.env.GITHUB_TOKEN ?? '',
      GH_REPO: process.env.GITHUB_REPOSITORY ?? '',
    },
  });
  console.log('Deleted the inbox issue.');
} catch (error) {
  // Not fatal: the mail was already sent. The issue can be cleaned up manually.
  console.error('Could not delete the issue:', error?.message ?? error);
}
