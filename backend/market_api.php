<?php
declare(strict_types=1);
require __DIR__ . '/common.php';

$body = $_SERVER['REQUEST_METHOD'] === 'POST' ? hxh_body() : [];
$action = (string)($_GET['action'] ?? $body['action'] ?? 'list');
$initData = (string)($_GET['initData'] ?? $body['initData'] ?? '');
$user = hxh_validate_init_data($initData);
$userId = hxh_user_id($user); $userName = hxh_user_name($user);

function clean_item(array $item): array {
    $allowed=['id','name','classId','className','type','rarity','itemLevel','level','upgradeLevel','stats','image','description','rollId','manaBalanceV2','equipmentBalanceV5','equipmentBalanceV6'];
    $out=[]; foreach($allowed as $k) if(array_key_exists($k,$item)) $out[$k]=$item[$k];
    $out['name']=hxh_cut((string)($out['name']??'Снаряжение'),80);
    $out['rarity']=in_array(($out['rarity']??''),['Обычный','Редкий','Легендарный','Мифический'],true)?$out['rarity']:'Обычный';
    $out['itemLevel']=max(1,min(100,(int)($out['itemLevel']??$out['level']??1)));$out['level']=$out['itemLevel'];
    $out['upgradeLevel']=max(1,min(10,(int)($out['upgradeLevel']??1)));
    if(!is_array($out['stats']??null))$out['stats']=[];
    foreach($out['stats'] as $k=>$v)$out['stats'][$k]=max(0,min(10000000,(float)$v));
    if(strlen(json_encode($out))>12000) hxh_json_response(['ok'=>false,'error'=>'item_too_large'],400);
    return $out;
}

if ($action === 'list') {
    $list = hxh_store('market', function(array &$rows) use ($userId) {
        $now=time();
        $out=[];
        foreach($rows as $r){
            if(($r['status']??'')!=='active')continue;
            if(($r['created_at']??0)<$now-30*86400)continue;
            $out[]=['id'=>$r['id'],'seller'=>$r['seller'],'sellerId'=>$r['seller_id'],'isMine'=>(string)$r['seller_id']===$userId,'item'=>$r['item'],'price'=>(int)$r['price'],'status'=>'active','createdAt'=>(int)$r['created_at']];
        }
        return $out;
    });
    hxh_json_response(['ok'=>true,'listings'=>$list,'premium_until'=>hxh_premium_until($userId)]);
}

if ($action === 'create') {
    $item=is_array($body['item']??null)?clean_item($body['item']):null;
    $price=max(0,(int)($body['price']??0));
    if(!$item||$price<50||$price>1000000000)hxh_json_response(['ok'=>false,'error'=>'invalid_listing'],400);
    $limit=hxh_premium_until($userId)>time()?10:5;
    $result=hxh_store('market', function(array &$rows) use($userId,$userName,$item,$price,$limit){
        $active=0;foreach($rows as $r)if(($r['status']??'')==='active'&&(string)($r['seller_id']??'')===$userId)$active++;
        if($active>=$limit)return ['error'=>'lot_limit'];
        $id=bin2hex(random_bytes(10));$rows[]=['id'=>$id,'seller_id'=>$userId,'seller'=>$userName,'item'=>$item,'price'=>$price,'status'=>'active','created_at'=>time(),'buyer_id'=>null,'sold_at'=>null,'proceeds_claimed'=>false];return ['id'=>$id];
    });
    if(!empty($result['error']))hxh_json_response(['ok'=>false,'error'=>$result['error']],409);
    hxh_json_response(['ok'=>true,'listing_id'=>$result['id'],'limit'=>$limit]);
}

if ($action === 'buy') {
    $id=preg_replace('/[^a-f0-9]/','',(string)($body['listing_id']??''));
    $result=hxh_store('market', function(array &$rows) use($id,$userId){
        foreach($rows as &$r){if(($r['id']??'')!==$id)continue;if(($r['status']??'')!=='active')return ['error'=>'not_active'];if((string)$r['seller_id']===$userId)return ['error'=>'own_listing'];$r['status']='sold';$r['buyer_id']=$userId;$r['sold_at']=time();return ['item'=>$r['item'],'price'=>(int)$r['price']];}return ['error'=>'not_found'];
    });
    if(!empty($result['error']))hxh_json_response(['ok'=>false,'error'=>$result['error']],409);
    hxh_json_response(['ok'=>true,'item'=>$result['item'],'price'=>$result['price']]);
}

if ($action === 'cancel') {
    $id=preg_replace('/[^a-f0-9]/','',(string)($body['listing_id']??''));
    $result=hxh_store('market', function(array &$rows) use($id,$userId){foreach($rows as &$r){if(($r['id']??'')!==$id)continue;if((string)$r['seller_id']!==$userId)return ['error'=>'forbidden'];if(($r['status']??'')!=='active')return ['error'=>'not_active'];$r['status']='cancelled';$r['cancelled_at']=time();return ['item'=>$r['item']];}return ['error'=>'not_found'];});
    if(!empty($result['error']))hxh_json_response(['ok'=>false,'error'=>$result['error']],409);
    hxh_json_response(['ok'=>true,'item'=>$result['item']]);
}

if ($action === 'claim_proceeds') {
    $premium = hxh_premium_until($userId) > time();
    $payoutRate = $premium ? .97 : .95;
    $sum=hxh_store('market', function(array &$rows) use($userId,$payoutRate){$sum=0;foreach($rows as &$r){if((string)($r['seller_id']??'')!==$userId||($r['status']??'')!=='sold'||!empty($r['proceeds_claimed']))continue;$sum+=max(0,(int)floor(((int)$r['price'])*$payoutRate));$r['proceeds_claimed']=true;$r['proceeds_claimed_at']=time();}return $sum;});
    hxh_json_response(['ok'=>true,'proceeds'=>$sum,'commission_percent'=>$premium?3:5]);
}

hxh_json_response(['ok'=>false,'error'=>'unknown_action'],400);
