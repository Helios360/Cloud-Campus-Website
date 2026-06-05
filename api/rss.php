<?php
$url = $_GET['url'] ?? '';

if (!$url) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing url param']);
    exit;
}

$parsed = parse_url($url);
if ($parsed === false) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid url']);
    exit;
}

$scheme = $parsed['scheme'] ?? '';
if (!in_array($scheme, ['http', 'https'], true)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Only http/https URLs are allowed']);
    exit;
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; RSS-proxy/1.0)',
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 5,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$body   = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error  = curl_error($ch);
curl_close($ch);

if ($body === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Failed to fetch feed', 'detail' => $error]);
    exit;
}

if ($status < 200 || $status >= 300) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => "Upstream returned $status"]);
    exit;
}

header('Content-Type: application/xml; charset=utf-8');
echo $body;
