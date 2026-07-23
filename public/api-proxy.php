<?php
/**
 * API Proxy — Routes /api/* requests to Node.js Express server on port 8999
 * Needed because Hostinger shared hosting does not support Apache mod_proxy
 */

$nodeUrl = 'http://127.0.0.1:8999';
$requestUri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Build full target URL
$targetUrl = $nodeUrl . $requestUri;

// Collect request headers (exclude Host to avoid conflicts)
$headers = [];
foreach (getallheaders() as $key => $value) {
    if (strtolower($key) !== 'host') {
        $headers[] = "$key: $value";
    }
}

// Read raw request body (for POST/PUT/PATCH)
$body = file_get_contents('php://input');

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

if (!empty($body)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle cURL error
if ($response === false) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Node.js server unavailable',
        'detail' => $curlError,
        'url' => $targetUrl
    ]);
    exit;
}

// Split response headers and body
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

// Forward response status code
http_response_code($httpCode);

// Forward relevant response headers
foreach (explode("\r\n", $responseHeaders) as $header) {
    if (preg_match('/^(Content-Type|Content-Disposition|Authorization|Set-Cookie|Access-Control-.*|X-.*|Cache-Control|ETag):/i', $header)) {
        header($header, false);
    }
}

echo $responseBody;
exit;
