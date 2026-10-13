<?php
require 'config.php';
require_login();

try {
    $db->prepare('UPDATE users SET is_online = 1, last_active = NOW() WHERE id = ?')->execute([$_SESSION['user_id']]);
} catch (Throwable $e) {}

$s = $db->prepare('SELECT id, username, email, role, avatar, COALESCE(full_name, username) as full_name, COALESCE(contact_number, phone) as contact_number, COALESCE(phone, contact_number) as phone, COALESCE(address, purok) as address, COALESCE(purok, address) as purok FROM users WHERE id = ?');
$s->execute([$_SESSION['user_id']]);
$u = $s->fetch();
if (!$u) { session_destroy(); out(['error' => 'Not logged in'], 401); }

$u['resident_id'] = 'RES-' . str_pad($u['id'], 4, '0', STR_PAD_LEFT);
$u['csrf_token'] = get_csrf_token();
out(['user' => $u]);

