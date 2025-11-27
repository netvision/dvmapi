<?php

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$config = [
    'id' => 'dvm-school-api',
    'name' => 'DVM School API',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm'   => '@vendor/npm-asset',
    ],
    'components' => [
        'request' => [
            'cookieValidationKey' => 'your-secret-key-here-replace-in-production',
            'enableCsrfValidation' => false, // Disable CSRF for API
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ]
        ],
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        'user' => [
            'identityClass' => 'app\models\User',
            'enableAutoLogin' => true,
            'enableSession' => false, // Disable sessions for API
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        'mailer' => [
            'class' => 'yii\swiftmailer\Mailer',
            'useFileTransport' => true,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'db' => $db,
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'rules' => [
                // API Routes
                'api/auth/login' => 'api/auth/login',
                'api/auth/logout' => 'api/auth/logout',
                'api/auth/register' => 'api/auth/register',
                
                // News API
                ['class' => 'yii\rest\UrlRule', 'controller' => 'api/news'],
                
                // Events API
                ['class' => 'yii\rest\UrlRule', 'controller' => 'api/events'],
                
                // Users API
                ['class' => 'yii\rest\UrlRule', 'controller' => 'api/users'],
                
                // Admin Routes
                'admin' => 'admin/dashboard/index',
                'admin/<controller:[\w-]+>' => 'admin/<controller>/index',
                'admin/<controller:[\w-]+>/<action:[\w-]+>' => 'admin/<controller>/<action>',
                'admin/<controller:[\w-]+>/<action:[\w-]+>/<id:\d+>' => 'admin/<controller>/<action>',
            ],
        ],
        'response' => [
            'class' => 'yii\web\Response',
            'on beforeSend' => function ($event) {
                $response = $event->sender;
                if ($response->format == 'html') {
                    return;
                }
                
                // Add CORS headers for API responses
                $response->headers->add('Access-Control-Allow-Origin', '*');
                $response->headers->add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                $response->headers->add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
                
                if (Yii::$app->request->method == 'OPTIONS') {
                    $response->setStatusCode(200);
                }
            },
        ],
    ],
    'params' => $params,
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
        'allowedIPs' => ['127.0.0.1', '::1'],
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
        'allowedIPs' => ['127.0.0.1', '::1'],
    ];
}

return $config;
