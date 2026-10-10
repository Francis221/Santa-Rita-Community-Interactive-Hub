<?php
require 'config.php';
require_login();

try {
    $db->prepare('UPDATE users SET is_online = 1, last_active = NOW() WHERE id = ?')->execute([$_SESSION['user_id']]);
} catch (Throwable $e) {}

$s = $db->prepare('SELECT id, username, email, role, avatar FROM users WHERE id = ?');
$s->execute([$_SESSION['user_id']]);
$u = $s->fetch();
if (!$u) { session_destroy(); out(['error' => 'Not logged in'], 401); }
out(['user' => $u]);
