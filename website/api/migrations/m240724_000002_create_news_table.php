<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%news}}`.
 */
class m240724_000002_create_news_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%news}}', [
            'id' => $this->primaryKey(),
            'title' => $this->string()->notNull(),
            'content' => $this->text()->notNull(),
            'excerpt' => $this->text(),
            'image_url' => $this->string(500),
            'status' => $this->smallInteger()->notNull()->defaultValue(0),
            'author_id' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        // Add foreign key for author_id
        $this->addForeignKey(
            'fk-news-author_id',
            '{{%news}}',
            'author_id',
            '{{%user}}',
            'id',
            'CASCADE'
        );

        // Add indexes
        $this->createIndex('idx-news-status', '{{%news}}', 'status');
        $this->createIndex('idx-news-created_at', '{{%news}}', 'created_at');

        // Insert sample news
        $this->insert('{{%news}}', [
            'title' => 'Welcome to DVM School API',
            'content' => 'This is the first news article in our school management system. We are excited to announce the launch of our new digital platform.',
            'excerpt' => 'Welcome to our new school management system...',
            'status' => 1,
            'author_id' => 1,
            'created_at' => time(),
            'updated_at' => time(),
        ]);

        $this->insert('{{%news}}', [
            'title' => 'Annual Sports Day 2025',
            'content' => 'We are pleased to announce our Annual Sports Day will be held on March 15, 2025. All students are encouraged to participate in various sporting events.',
            'excerpt' => 'Annual Sports Day announcement for 2025...',
            'status' => 1,
            'author_id' => 1,
            'created_at' => time(),
            'updated_at' => time(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropForeignKey('fk-news-author_id', '{{%news}}');
        $this->dropTable('{{%news}}');
    }
}
