<?php

namespace app\controllers\admin;

use Yii;
use app\models\News;
use app\models\Events;
use app\models\User;

/**
 * Dashboard Controller for Admin Panel
 */
class DashboardController extends BaseAdminController
{
    /**
     * Admin dashboard
     */
    public function actionIndex()
    {
        // Get statistics
        $newsCount = News::find()->count();
        $eventsCount = Events::find()->count();
        $usersCount = User::find()->count();
        
        $recentNews = News::find()
            ->orderBy(['created_at' => SORT_DESC])
            ->limit(5)
            ->all();
            
        $upcomingEvents = Events::getUpcomingEvents(5);

        return $this->render('index', [
            'newsCount' => $newsCount,
            'eventsCount' => $eventsCount,
            'usersCount' => $usersCount,
            'recentNews' => $recentNews,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }
}
