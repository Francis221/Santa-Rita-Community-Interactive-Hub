<?php
require 'config.php';
require_login();
$total = (int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn();
$legacy = (int)$db->query("SELECT COUNT(*) FROM users WHERE password NOT LIKE '$2y$%' AND password NOT LIKE '$argon%'")->fetchColumn();
$latest = $db->query('SELECT username, email FROM users ORDER BY id DESC LIMIT 5')->fetchAll();
out(['total' => $total, 'legacy' => $legacy, 'latest' => $latest]);
