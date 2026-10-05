<?php
declare(strict_types=1);

function hxh_json_response(array $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function hxh_config(): array {
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $path = __DIR__ . '/config.php';
    if (!is_file($path)) hxh_json_response(['ok'=>false,'error'=>'backend_not_configured'], 503);
    $cfg = require $path;
    if (!is_array($cfg) || empty($cfg['bot_token'])) hxh_json_response(['ok'=>false,'error'=>'invalid_backend_config'], 503);
    return $cfg;
}

function hxh_body(): array {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function hxh_validate_init_data(string $initData): array {
    if ($initData === '') hxh_json_response(['ok'=>false,'error'=>'missing_init_data'], 401);
    parse_str($initData, $data);
    $hash = isset($data['hash']) ? (string)$data['hash'] : '';
    if ($hash === '') hxh_json_response(['ok'=>false,'error'=>'missing_hash'], 401);
    unset($data['hash']);
    ksort($data, SORT_STRING);
    $pairs = [];
    foreach ($data as $k => $v) $pairs[] = $k . '=' . $v;
    $check = implode("\n", $pairs);
    $cfg = hxh_config();
    // Telegram Mini Apps: HMAC-SHA256(bot_token, key="WebAppData") -> secret key.
    $secret = hash_hmac('sha256', (string)$cfg['bot_token'], 'WebAppData', true);
    $calc = hash_hmac('sha256', $check, $secret);
    if (!hash_equals($calc, $hash)) hxh_json_response(['ok'=>false,'error'=>'invalid_init_data'], 401);
    $authDate = isset($data['auth_date']) ? (int)$data['auth_date'] : 0;
    $maxAge = max(300, (int)($cfg['init_data_max_age'] ?? 86400));
    if ($authDate <= 0 || abs(time() - $authDate) > $maxAge) hxh_json_response(['ok'=>false,'error'=>'expired_init_data'], 401);
    $user = json_decode((string)($data['user'] ?? ''), true);
    if (!is_array($user) || empty($user['id'])) hxh_json_response(['ok'=>false,'error'=>'missing_user'], 401);
    return $user;
}

function hxh_store(string $name, callable $callback) {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        hxh_json_response(['ok'=>false,'error'=>'storage_unavailable'], 500);
    }
    $path = $dir . '/' . preg_replace('/[^a-z0-9_-]/i', '', $name) . '.json';
    $fp = fopen($path, 'c+');
    if (!$fp) hxh_json_response(['ok'=>false,'error'=>'storage_unavailable'], 500);
    try {
        if (!flock($fp, LOCK_EX)) throw new RuntimeException('lock_failed');
        rewind($fp);
        $raw = stream_get_contents($fp) ?: '';
        $data = json_decode($raw, true);
        if (!is_array($data)) $data = [];
        $result = $callback($data);
        rewind($fp);
        ftruncate($fp, 0);
        fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return $result;
    } catch (Throwable $e) {
        @flock($fp, LOCK_UN); @fclose($fp);
        hxh_json_response(['ok'=>false,'error'=>'storage_error'], 500);
    }
}

function hxh_telegram_api(string $method, array $payload): array {
    $token = (string)hxh_config()['bot_token'];
    $url = 'https://api.telegram.org/bot' . $token . '/' . $method;
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true,CURLOPT_POST=>true,CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_POSTFIELDS=>$json,CURLOPT_TIMEOUT=>12]);
        $raw = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE); curl_close($ch);
    } else {
        $ctx = stream_context_create(['http'=>['method'=>'POST','header'=>"Content-Type: application/json\r\n",'content'=>$json,'timeout'=>12,'ignore_errors'=>true]]);
        $raw = @file_get_contents($url, false, $ctx); $code = 200;
    }
    $out = json_decode((string)$raw, true);
    if (!is_array($out) || empty($out['ok'])) hxh_json_response(['ok'=>false,'error'=>'telegram_api_error','details'=>$out['description'] ?? 'unknown'], 502);
    return $out;
}

function hxh_products(): array {
    return [
        'nen_100'    => ['title'=>'100 Камней Нэн','stars'=>49,'reward'=>['gems'=>100]],
        'nen_260'    => ['title'=>'260 Камней Нэн','stars'=>99,'reward'=>['gems'=>260]],
        'nen_600'    => ['title'=>'600 Камней Нэн','stars'=>199,'reward'=>['gems'=>600]],
        'nen_1400'   => ['title'=>'1 400 Камней Нэн','stars'=>399,'reward'=>['gems'=>1400]],
        'nen_3200'   => ['title'=>'3 200 Камней Нэн','stars'=>799,'reward'=>['gems'=>3200]],
        'premium_30' => ['title'=>'Hunter Premium — 30 дней','stars'=>299,'reward'=>['premiumDays'=>30]],
    ];
}

function hxh_user_id(array $user): string { return (string)$user['id']; }
function hxh_cut(string $value, int $length): string { return function_exists('mb_substr') ? mb_substr($value, 0, $length) : substr($value, 0, $length); }
function hxh_user_name(array $user): string {
    $name = trim((string)($user['username'] ?? ''));
    if ($name !== '') return '@' . hxh_cut($name, 28);
    $name = trim(((string)($user['first_name'] ?? '')) . ' ' . ((string)($user['last_name'] ?? '')));
    return hxh_cut($name !== '' ? $name : 'Охотник', 32);
}

function hxh_premium_until(string $userId): int {
    return (int)hxh_store('entitlements', function(array &$d) use ($userId) { return (int)($d[$userId]['premium_until'] ?? 0); });
}

function hxh_wallet(string $userId): array {
    return hxh_store('entitlements', function(array &$d) use ($userId) {
        $u = is_array($d[$userId] ?? null) ? $d[$userId] : [];
        return ['premium_until'=>(int)($u['premium_until'] ?? 0),'gems_total'=>(int)($u['gems_total'] ?? 0)];
    });
}
function hxh_add_gems(string $userId, int $gems): int {
    return (int)hxh_store('entitlements', function(array &$d) use ($userId,$gems) {
        $u = is_array($d[$userId] ?? null) ? $d[$userId] : [];
        $u['gems_total'] = max(0,(int)($u['gems_total'] ?? 0)) + max(0,$gems);
        $u['premium_until'] = (int)($u['premium_until'] ?? 0);
        $d[$userId] = $u;
        return (int)$u['gems_total'];
    });
}

function hxh_extend_premium(string $userId, int $days): int {
    return (int)hxh_store('entitlements', function(array &$d) use ($userId, $days) {
        // Не перезаписываем серверный баланс Камней Нэн при продлении Premium.
        $u = is_array($d[$userId] ?? null) ? $d[$userId] : [];
        $from = max(time(), (int)($u['premium_until'] ?? 0));
        $until = $from + max(1,$days)*86400;
        $u['premium_until'] = $until;
        $u['gems_total'] = max(0, (int)($u['gems_total'] ?? 0));
        $d[$userId] = $u;
        return $until;
    });
}
