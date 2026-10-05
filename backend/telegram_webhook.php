<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$cfg = hxh_config();
$expected = (string)($cfg['webhook_secret'] ?? '');
$got = (string)($_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '');
if ($expected !== '' && !hash_equals($expected, $got)) hxh_json_response(['ok'=>false,'error'=>'forbidden'], 403);
$update = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($update)) hxh_json_response(['ok'=>true]);
if (!empty($update['pre_checkout_query'])) {
    $q = $update['pre_checkout_query'];
    $payload = (string)($q['invoice_payload'] ?? '');
    $currency = (string)($q['currency'] ?? '');
    $total = (int)($q['total_amount'] ?? -1);
    $ok = false;
    hxh_store('orders', function(array &$orders) use (&$ok,$payload,$currency,$total) {
        foreach ($orders as $o) {
            if (($o['payload'] ?? '') === $payload && ($o['status'] ?? '') === 'pending' && $currency === 'XTR' && (int)($o['stars'] ?? -2) === $total) {$ok=true;break;}
        }
        return null;
    });
    $answer = ['pre_checkout_query_id'=>(string)$q['id'],'ok'=>$ok];
    if (!$ok) $answer['error_message'] = 'Счёт устарел или имеет неверную сумму.';
    hxh_telegram_api('answerPreCheckoutQuery', $answer);
    hxh_json_response(['ok'=>true]);
}
$payment = $update['message']['successful_payment'] ?? null;
if (is_array($payment)) {
    $payload=(string)($payment['invoice_payload'] ?? ''); $currency=(string)($payment['currency'] ?? ''); $amount=(int)($payment['total_amount'] ?? -1);
    $charge=(string)($payment['telegram_payment_charge_id'] ?? '');
    hxh_store('orders', function(array &$orders) use ($payload,$currency,$amount,$charge) {
        foreach ($orders as &$o) {
            if (($o['payload'] ?? '') !== $payload) continue;
            if ($currency !== 'XTR' || (int)($o['stars'] ?? -2) !== $amount) break;
            if (($o['status'] ?? '') === 'pending') {$o['status']='paid';$o['paid_at']=time();$o['telegram_charge_id']=$charge;}
            break;
        }
        return null;
    });
}
hxh_json_response(['ok'=>true]);
