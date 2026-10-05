<?php
declare(strict_types=1);
require __DIR__ . '/common.php';
$body = hxh_body();
$user = hxh_validate_init_data((string)($body['initData'] ?? ''));
$userId = hxh_user_id($user);
$orderId = preg_replace('/[^a-f0-9]/', '', (string)($body['order_id'] ?? ''));
if ($orderId === '') hxh_json_response(['ok'=>false,'error'=>'missing_order'], 400);
$products = hxh_products();
$result = hxh_store('orders', function(array &$orders) use ($orderId,$userId,$products) {
    if (!isset($orders[$orderId])) return ['error'=>'order_not_found'];
    $o =& $orders[$orderId];
    if ((string)$o['user_id'] !== $userId) return ['error'=>'wrong_user'];
    if (!in_array(($o['status'] ?? ''), ['paid','claimed'], true)) return ['error'=>'payment_not_confirmed'];
    $product = $products[$o['product']] ?? null;
    if (!$product) return ['error'=>'unknown_product'];
    $firstClaim = empty($o['claimed_at']);
    if ($firstClaim) { $o['claimed_at'] = time(); $o['status'] = 'claimed'; }
    return ['reward'=>$product['reward'],'product'=>$o['product'],'first_claim'=>$firstClaim];
});
if (!empty($result['error'])) hxh_json_response(['ok'=>false,'error'=>$result['error']], 409);
// Начисление на серверный монотонный кошелёк выполняется только один раз.
if (!empty($result['first_claim'])) {
    if (!empty($result['reward']['gems'])) hxh_add_gems($userId, (int)$result['reward']['gems']);
    if (!empty($result['reward']['premiumDays'])) hxh_extend_premium($userId, (int)$result['reward']['premiumDays']);
}
hxh_json_response(['ok'=>true,'reward'=>$result['reward'],'wallet'=>hxh_wallet($userId),'first_claim'=>(bool)$result['first_claim']]);
