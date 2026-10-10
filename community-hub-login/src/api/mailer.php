<?php
require_once __DIR__ . '/config.php';

function sendResetCodeEmail($toEmail, $code)
{
    if (empty(EMAILJS_SERVICE_ID) || empty(EMAILJS_PUBLIC_KEY) || EMAILJS_PUBLIC_KEY === 'your_public_key') {
        error_log("EmailJS Error: Credentials not configured in src/api/config.php");
        return ['success' => false, 'error' => 'EmailJS credentials not configured in api/config.php'];
    }

    $toName = explode('@', $toEmail)[0];

    $payload = [
        'service_id' => EMAILJS_SERVICE_ID,
        'template_id' => EMAILJS_TEMPLATE_ID,
        'user_id' => EMAILJS_PUBLIC_KEY,
        'template_params' => [
            'to_email'   => $toEmail,
            'email'      => $toEmail,
            'user_email' => $toEmail,
            'recipient'  => $toEmail,
            'to_name'    => ucfirst($toName),
            'passcode'   => $code,
            'pass_code'  => $code,
            'code'       => $code,
            'time'       => '10 minutes',
        ],
    ];

    if (defined('EMAILJS_PRIVATE_KEY') && !empty(EMAILJS_PRIVATE_KEY)) {
        $payload['accessToken'] = EMAILJS_PRIVATE_KEY;
    }

    $ch = curl_init('https://api.emailjs.com/api/v1.0/email/send');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 || $response === 'OK') {
        return ['success' => true];
    } else {
        error_log("EmailJS Error ({$httpCode}): {$response}");
        return ['success' => false, 'error' => "EmailJS send failed ({$httpCode}): {$response}"];
    }
}
