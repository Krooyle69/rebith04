<?php
// Скопируйте этот файл в config.php и заполните значения.
return [
    'bot_token' => '123456789:REPLACE_WITH_BOT_TOKEN',
    // Любая длинная случайная строка. Ту же строку передайте Telegram при setWebhook как secret_token.
    'webhook_secret' => 'REPLACE_WITH_LONG_RANDOM_SECRET',
    // Максимальный возраст Telegram Mini App initData. 24 часа достаточно для обычной игровой сессии.
    'init_data_max_age' => 86400,
];
