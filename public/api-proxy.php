<?php
/**
 * API Proxy — Routes /api/* requests to Node.js Express server on port 8999
 * Needed because Hostinger shared hosting does not support Apache mod_proxy
 */

// Suppress PHP errors from leaking to JSON clients
error_reporting(0);
@ini_set('display_errors', '0');

$nodeUrl = 'http://127.0.0.1:8999';
$requestUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

// Handle CORS Preflight OPTIONS requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Build full target URL
$targetUrl = $nodeUrl . $requestUri;

// Collect request headers safely (getallheaders() not always available in CGI)
$headers = [];
if (function_exists('getallheaders')) {
    foreach (getallheaders() as $key => $value) {
        $lower = strtolower($key);
        if ($lower !== 'host' && $lower !== 'connection') {
            $headers[] = "$key: $value";
        }
    }
} else {
    // Fallback: manually build headers from $_SERVER
    foreach ($_SERVER as $key => $value) {
        if (substr($key, 0, 5) === 'HTTP_') {
            $headerName = str_replace('_', '-', substr($key, 5));
            $headers[] = "$headerName: $value";
        }
    }
    if (isset($_SERVER['CONTENT_TYPE'])) {
        $headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
    }
}

// Read raw request body (for POST/PUT/PATCH)
$body = @file_get_contents('php://input');

// Check if cURL is available
if (!function_exists('curl_init')) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'PHP cURL extension not available on this server']);
    exit;
}

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
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

// Handle cURL error (Node.js server not running)
if ($response === false || $httpCode === 0) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Node.js backend not reachable',
        'detail' => $curlError,
        'target' => $targetUrl
    ]);
    exit;
}

// Split response headers and body
$responseBody = substr($response, $headerSize);
$responseHeaders = substr($response, 0, $headerSize);

// Forward response status code
http_response_code($httpCode);

// Forward relevant response headers
foreach (explode("\r\n", $responseHeaders) as $header) {
    if (preg_match('/^(Content-Type|Set-Cookie|Access-Control-.*|Cache-Control|ETag|Authorization):/i', $header)) {
        @header($header, false);
    }
}

// Ensure JSON content type
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
}

echo $responseBody;
exit;
