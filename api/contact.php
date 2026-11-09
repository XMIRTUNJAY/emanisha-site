<?php
// eManisha static-site form endpoint (contact + newsletter + notify).
// Deploy: ships with the site under /api/contact.php on any PHP host.
// Delivery: PHP mail() From: noreply@emanisha.in To: site owner Gmail.
// Expects POST (JSON or form-encoded):
//   kind: contact|newsletter|notify | name?, email, message?, source?
//   website: honeypot — must stay empty.
// Returns JSON { ok: true } or { ok: false, error } with HTTP 200/400/429/500.
header('Content-Type: application/json; charset=utf-8');

$OWNER_EMAIL = 'mrxubr@gmail.com';
$FROM_EMAIL = 'noreply@emanisha.in';
$FROM_NAME = 'eManisha Site';

function fail($error, $code = 400) {
	http_response_code((int) $code);
	echo json_encode(['ok' => false, 'error' => (string) $error]);
	exit;
}

// Read JSON or classic form posts.
$input = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') !== false) {
	$raw = file_get_contents('php://input');
	$decoded = json_decode($raw ?: '', true);
	if (is_array($decoded)) $input = $decoded;
} else {
	$input = $_POST;
}
$str = function ($v, $max) {
	$v = is_string($v) ? trim($v) : '';
	// Strip CR/LF to block mail header injection.
	$v = str_replace(["\r", "\n", '%0a', '%0d', '%0A', '%0D'], '', $v);
	return mb_substr($v, 0, (int) $max);
};

$kind = $str($input['kind'] ?? '', 20);
$email = $str($input['email'] ?? '', 254);
$name = $str($input['name'] ?? '', 120);
$message = $str($input['message'] ?? '', 5000);
$source = $str($input['source'] ?? '', 80);

// Honeypot: bots fill it, humans never see it.
if (($input['website'] ?? '') !== '') {
	echo json_encode(['ok' => true]);
	exit;
}

if (!in_array($kind, ['contact', 'newsletter', 'notify'], true)) {
	fail('unknown form kind');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	fail('please give a valid email address');
}
if ($kind === 'contact' && (mb_strlen($message) < 10 || $name === '')) {
	fail('please add your name and a few words');
}

// Throttle: max 5 submissions per IP per hour (file in system temp).
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/emanisha-form-' . preg_replace('/[^a-zA-Z0-9.:_-]/', '_', $ip) . '.log';
$window = 3600;
$now = time();
$hits = [];
if (is_readable($bucket)) {
	foreach (explode("\n", file_get_contents($bucket) ?: '') as $line) {
		$t = (int) trim($line);
		if ($t > $now - $window) $hits[] = $t;
	}
}
if (count($hits) >= 5) {
	fail('too many attempts — please try again later', 429);
}
$hits[] = $now;
@file_put_contents($bucket, implode("\n", $hits));

$labels = ['contact' => 'Contact message', 'newsletter' => 'Newsletter signup', 'notify' => 'Notify-me signup'];
$subject = '[emanisha.in] ' . $labels[$kind] . ($source !== '' ? " ({$source})" : '');

$lines = ["Kind: {$labels[$kind]}"];
if ($source !== '') $lines[] = "Source: {$source}";
if ($name !== '') $lines[] = "Name: {$name}";
$lines[] = "Email: {$email}";
if ($message !== '') $lines[] = '';
if ($message !== '') $lines[] = $message;
$lines[] = '';
$lines[] = 'IP: ' . $ip;
$lines[] = 'Date: ' . gmdate('Y-m-d H:i:s') . ' UTC';
$body = implode("\n", $lines);

$headers = [];
$headers[] = 'From: ' . mb_encode_mimeheader($FROM_NAME, 'UTF-8') . " <{$FROM_EMAIL}>";
$headers[] = 'Reply-To: ' . ($name !== '' ? mb_encode_mimeheader($name, 'UTF-8') . " <{$email}>" : $email);
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: emanisha-contact/1.0';

$sent = @mail($OWNER_EMAIL, mb_encode_mimeheader($subject, 'UTF-8'), $body, implode("\r\n", $headers));
if (!$sent) {
	// Classic form posts can't read JSON — send them back with a flag.
	$next = $str($input['_next'] ?? '', 200);
	if (stripos($contentType, 'application/json') === false && $next !== '' && $next[0] === '/') {
		header('Location: ' . $next . (strpos($next, '?') === false ? '?' : '&') . 'sent=0');
		exit;
	}
	fail('mailer unavailable — please try again later', 500);
}
// Classic form posts (native submit, no fetch): redirect back.
$next = $str($input['_next'] ?? '', 200);
if (stripos($contentType, 'application/json') === false && $next !== '' && $next[0] === '/') {
	header('Location: ' . $next . (strpos($next, '?') === false ? '?' : '&') . 'sent=1');
	exit;
}
echo json_encode(['ok' => true]);
