<?php

namespace app\controllers\api;

use app\models\News;

/**
 * News API Controller
 */
class NewsController extends BaseApiController
{
    public $modelClass = News::class;

    /**
     * {@inheritdoc}
     */
    public function actions()
    {
        $actions = parent::actions();

        // Customize actions if needed
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];

        return $actions;
    }

    /**
     * Prepare data provider for news listing
     */
    public function prepareDataProvider()
    {
        $query = News::find()->with('author');

        // Filter by status if provided
        if ($status = \Yii::$app->request->get('status')) {
            $query->andWhere(['status' => $status]);
        }

        // Search by title or content
        if ($search = \Yii::$app->request->get('search')) {
            $query->andWhere(['or',
                ['like', 'title', $search],
                ['like', 'content', $search]
            ]);
        }

        // Only show published news for non-authenticated users
        if (\Yii::$app->user->isGuest) {
            $query->andWhere(['status' => News::STATUS_PUBLISHED]);
        }

        $dataProvider = new \yii\data\ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => \Yii::$app->request->get('per-page', 20),
            ],
            'sort' => [
                'defaultOrder' => ['created_at' => SORT_DESC],
            ],
        ]);

        return $dataProvider;
    }
}
