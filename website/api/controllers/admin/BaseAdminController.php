<?php

namespace app\controllers\admin;

use Yii;
use yii\web\Controller;
use yii\filters\AccessControl;

/**
 * Base Admin Controller
 */
class BaseAdminController extends Controller
{
    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::class,
                'rules' => [
                    [
                        'allow' => true,
                        'roles' => ['@'], // Only authenticated users
                    ],
                ],
            ],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function beforeAction($action)
    {
        // Set layout for admin panel
        $this->layout = 'admin';
        
        return parent::beforeAction($action);
    }
}
