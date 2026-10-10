<?php
require 'config.php';

if (!empty($_SESSION['user_id'])) {
    try {
        $db->prepare('UPDATE users SET is_online = 0 WHERE id = ?')->execute([$_SESSION['user_id']]);
    } catch (Throwable $e) {}
}

$_SESSION = [];
session_destroy();
out(['ok' => true]);
