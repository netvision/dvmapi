<?php

namespace app\controllers\api;

use Yii;
use yii\rest\Controller;
use yii\filters\Cors;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;
use app\models\User;

/**
 * Authentication API Controller
 */
class AuthController extends Controller
{
    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        $behaviors = parent::behaviors();

        // Add CORS filter
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => ['*'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => true,
                'Access-Control-Max-Age' => 86400,
            ],
        ];

        return $behaviors;
    }

    /**
     * Login action
     */
    public function actionLogin()
    {
        $request = Yii::$app->request;
        
        if (!$request->isPost) {
            throw new BadRequestHttpException('Only POST method is allowed');
        }

        $username = $request->post('username');
        $password = $request->post('password');

        if (empty($username) || empty($password)) {
            throw new BadRequestHttpException('Username and password are required');
        }

        $user = User::findByUsername($username);
        if (!$user || !$user->validatePassword($password)) {
            throw new UnauthorizedHttpException('Invalid username or password');
        }

        $token = $user->generateJwtToken();

        return [
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                ],
                'token' => $token,
                'expires_in' => Yii::$app->params['jwtExpire'],
            ]
        ];
    }

    /**
     * Register action
     */
    public function actionRegister()
    {
        $request = Yii::$app->request;
        
        if (!$request->isPost) {
            throw new BadRequestHttpException('Only POST method is allowed');
        }

        $user = new User();
        $user->username = $request->post('username');
        $user->email = $request->post('email');
        $user->setPassword($request->post('password'));

        if ($user->save()) {
            $token = $user->generateJwtToken();

            return [
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                    ],
                    'token' => $token,
                    'expires_in' => Yii::$app->params['jwtExpire'],
                ]
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Registration failed',
                'errors' => $user->errors
            ];
        }
    }

    /**
     * Logout action
     */
    public function actionLogout()
    {
        return [
            'success' => true,
            'message' => 'Logout successful'
        ];
    }

    /**
     * Get current user info
     */
    public function actionMe()
    {
        $user = Yii::$app->user->identity;
        
        if (!$user) {
            throw new UnauthorizedHttpException('User not authenticated');
        }

        return [
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'status' => $user->status,
                    'created_at' => date('Y-m-d H:i:s', $user->created_at),
                ]
            ]
        ];
    }

    /**
     * {@inheritdoc}
     */
    protected function verbs()
    {
        return [
            'login' => ['POST', 'OPTIONS'],
            'register' => ['POST', 'OPTIONS'],
            'logout' => ['POST', 'OPTIONS'],
            'me' => ['GET', 'OPTIONS'],
        ];
    }
}
