<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'clerk' => [
        'secret_key' => env('CLERK_SECRET_KEY'),
        'issuer' => env('CLERK_ISSUER'),
        'jwks_url' => env('CLERK_JWKS_URL'),
        'allow_test_tokens' => env('CLERK_ALLOW_TEST_TOKENS', false),
        'authorized_parties' => array_filter(array_map(
            'trim',
            explode(',', env('CLERK_AUTHORIZED_PARTIES', env('FRONTEND_URL', 'http://localhost:5173')))
        )),
        'admin_emails' => array_filter(array_map('strtolower', array_map(
            'trim',
            explode(',', env('EDUCRAFT_ADMIN_EMAILS', ''))
        ))),
    ],

];
