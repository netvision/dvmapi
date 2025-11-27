<?php

namespace app\controllers\api;

use app\models\Events;

/**
 * Events API Controller
 */
class EventsController extends BaseApiController
{
    public $modelClass = Events::class;

    /**
     * {@inheritdoc}
     */
    public function actions()
    {
        $actions = parent::actions();

        // Add custom actions
        $actions['upcoming'] = [
            'class' => 'yii\rest\Action',
            'modelClass' => $this->modelClass,
            'runWithParams' => [$this, 'actionUpcoming'],
        ];

        $actions['past'] = [
            'class' => 'yii\rest\Action',
            'modelClass' => $this->modelClass,
            'runWithParams' => [$this, 'actionPast'],
        ];

        return $actions;
    }

    /**
     * Prepare data provider for events listing
     */
    public function prepareDataProvider()
    {
        $query = Events::find()->with('author');

        // Filter by status if provided
        if ($status = \Yii::$app->request->get('status')) {
            $query->andWhere(['status' => $status]);
        }

        // Search by title or description
        if ($search = \Yii::$app->request->get('search')) {
            $query->andWhere(['or',
                ['like', 'title', $search],
                ['like', 'description', $search]
            ]);
        }

        // Filter by date range
        if ($from = \Yii::$app->request->get('from')) {
            $query->andWhere(['>=', 'event_date', strtotime($from)]);
        }

        if ($to = \Yii::$app->request->get('to')) {
            $query->andWhere(['<=', 'event_date', strtotime($to)]);
        }

        // Only show published events for non-authenticated users
        if (\Yii::$app->user->isGuest) {
            $query->andWhere(['status' => Events::STATUS_PUBLISHED]);
        }

        $dataProvider = new \yii\data\ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => \Yii::$app->request->get('per-page', 20),
            ],
            'sort' => [
                'defaultOrder' => ['event_date' => SORT_ASC],
            ],
        ]);

        return $dataProvider;
    }

    /**
     * Get upcoming events
     */
    public function actionUpcoming()
    {
        $limit = \Yii::$app->request->get('limit', 5);
        $events = Events::getUpcomingEvents($limit);

        return $events;
    }

    /**
     * Get past events
     */
    public function actionPast()
    {
        $limit = \Yii::$app->request->get('limit', 10);
        $events = Events::getPastEvents($limit);

        return $events;
    }
}
