<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * This file allows us to run Laravel in a subdirectory or through Laragon
 * without needing manual document root adjustments.
 */
$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? ''
);

// If the file exists in public/, let the server serve it
if ($uri !== '/' && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

require_once __DIR__.'/public/index.php';
