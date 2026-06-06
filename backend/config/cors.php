<?php

$frontendUrls = array_filter(array_map(
    'trim',
    explode(',', env('FRONTEND_URLS', env('FRONTEND_URL', '')))
));

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $frontendUrls,

    'allowed_origins_patterns' => [
        '#^http://(localhost|127\.0\.0\.1):5173$#',
        '#^https://edu-workshop-hub(?:-[a-z0-9-]+)?\.vercel\.app$#',
        '#^https://edu-workshop-hub-git-[a-z0-9-]+-alexm-058s-projects\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
