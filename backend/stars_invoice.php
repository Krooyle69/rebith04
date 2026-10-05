<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$body = hxh_body();
$user = hxh_validate_init_data((string)($body['initData'] ?? ''));
$productId = (string)($body['product'] ?? '');
$products = hxh_products();
if (!isset($products[$productId])) hxh_json_response(['ok'=>false,'error'=>'unknown_product'], 400);
$p = $products[$productId];
$orderId = bin2hex(random_bytes(12));
$payload = 'hxh:' . $orderId . ':' . bin2hex(random_bytes(8));
$userId = hxh_user_id($user);
hxh_store('orders', function(array &$orders) use ($orderId,$payload,$userId,$productId,$p) {
    $orders[$orderId] = ['id'=>$orderId,'payload'=>$payload,'user_id'=>$userId,'product'=>$productId,'stars'=>(int)$p['stars'],'status'=>'pending','created_at'=>time(),'telegram_charge_id'=>null,'claimed_at'=>null];
    return true;
});
$invoice = hxh_telegram_api('createInvoiceLink', [
    'title' => $p['title'],
    'description' => $productId === 'premium_30' ? '30 дней Hunter Premium в Nen Hunter.' : 'Камни Нэн для внутриигрового магазина Nen Hunter.',
    'payload' => $payload,
    'currency' => 'XTR',
    'prices' => [['label'=>$p['title'],'amount'=>(int)$p['stars']]],
]);
hxh_json_response(['ok'=>true,'order_id'=>$orderId,'invoice_link'=>$invoice['result']]);
