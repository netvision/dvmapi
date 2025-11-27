<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

/**
 * Events model
 *
 * @property integer $id
 * @property string $title
 * @property string $description
 * @property string $location
 * @property string $image_url
 * @property integer $event_date
 * @property integer $status
 * @property integer $author_id
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property User $author
 */
class Events extends ActiveRecord
{
    const STATUS_DRAFT = 0;
    const STATUS_PUBLISHED = 1;
    const STATUS_CANCELLED = 2;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%events}}';
    }

    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            TimestampBehavior::class,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['title', 'description', 'event_date'], 'required'],
            [['description'], 'string'],
            [['event_date', 'status', 'author_id', 'created_at', 'updated_at'], 'integer'],
            [['title', 'location'], 'string', 'max' => 255],
            [['image_url'], 'string', 'max' => 500],
            [['status'], 'default', 'value' => self::STATUS_DRAFT],
            [['status'], 'in', 'range' => [self::STATUS_DRAFT, self::STATUS_PUBLISHED, self::STATUS_CANCELLED]],
            [['author_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['author_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'title' => 'Title',
            'description' => 'Description',
            'location' => 'Location',
            'image_url' => 'Image URL',
            'event_date' => 'Event Date',
            'status' => 'Status',
            'author_id' => 'Author ID',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }

    /**
     * Gets query for [[Author]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getAuthor()
    {
        return $this->hasOne(User::class, ['id' => 'author_id']);
    }

    /**
     * {@inheritdoc}
     */
    public function fields()
    {
        $fields = parent::fields();
        $fields['author'] = function ($model) {
            return $model->author ? [
                'id' => $model->author->id,
                'username' => $model->author->username,
            ] : null;
        };
        $fields['status_text'] = function ($model) {
            switch ($model->status) {
                case self::STATUS_PUBLISHED:
                    return 'Published';
                case self::STATUS_CANCELLED:
                    return 'Cancelled';
                default:
                    return 'Draft';
            }
        };
        $fields['event_date_formatted'] = function ($model) {
            return date('Y-m-d H:i:s', $model->event_date);
        };
        $fields['created_date'] = function ($model) {
            return date('Y-m-d H:i:s', $model->created_at);
        };
        $fields['updated_date'] = function ($model) {
            return date('Y-m-d H:i:s', $model->updated_at);
        };
        return $fields;
    }

    /**
     * {@inheritdoc}
     */
    public function beforeSave($insert)
    {
        if (parent::beforeSave($insert)) {
            if ($insert && !$this->author_id) {
                $this->author_id = Yii::$app->user->id;
            }
            return true;
        }
        return false;
    }

    /**
     * Get upcoming events
     */
    public static function getUpcomingEvents($limit = 5)
    {
        return static::find()
            ->where(['status' => self::STATUS_PUBLISHED])
            ->andWhere(['>', 'event_date', time()])
            ->orderBy(['event_date' => SORT_ASC])
            ->limit($limit)
            ->all();
    }

    /**
     * Get past events
     */
    public static function getPastEvents($limit = 10)
    {
        return static::find()
            ->where(['status' => self::STATUS_PUBLISHED])
            ->andWhere(['<', 'event_date', time()])
            ->orderBy(['event_date' => SORT_DESC])
            ->limit($limit)
            ->all();
    }
}
