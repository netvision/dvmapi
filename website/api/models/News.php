<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

/**
 * News model
 *
 * @property integer $id
 * @property string $title
 * @property string $content
 * @property string $excerpt
 * @property string $image_url
 * @property integer $status
 * @property integer $author_id
 * @property integer $created_at
 * @property integer $updated_at
 *
 * @property User $author
 */
class News extends ActiveRecord
{
    const STATUS_DRAFT = 0;
    const STATUS_PUBLISHED = 1;

    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%news}}';
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
            [['title', 'content'], 'required'],
            [['content', 'excerpt'], 'string'],
            [['status', 'author_id', 'created_at', 'updated_at'], 'integer'],
            [['title'], 'string', 'max' => 255],
            [['image_url'], 'string', 'max' => 500],
            [['status'], 'default', 'value' => self::STATUS_DRAFT],
            [['status'], 'in', 'range' => [self::STATUS_DRAFT, self::STATUS_PUBLISHED]],
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
            'content' => 'Content',
            'excerpt' => 'Excerpt',
            'image_url' => 'Image URL',
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
            return $model->status == self::STATUS_PUBLISHED ? 'Published' : 'Draft';
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
            
            // Auto-generate excerpt if not provided
            if (empty($this->excerpt)) {
                $this->excerpt = substr(strip_tags($this->content), 0, 200) . '...';
            }
            
            return true;
        }
        return false;
    }
}
