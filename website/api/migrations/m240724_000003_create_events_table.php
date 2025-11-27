<?php

use yii\db\Migration;

/**
 * Handles the creation of table `{{%events}}`.
 */
class m240724_000003_create_events_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('{{%events}}', [
            'id' => $this->primaryKey(),
            'title' => $this->string()->notNull(),
            'description' => $this->text()->notNull(),
            'location' => $this->string(),
            'image_url' => $this->string(500),
            'event_date' => $this->integer()->notNull(),
            'status' => $this->smallInteger()->notNull()->defaultValue(0),
            'author_id' => $this->integer()->notNull(),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        // Add foreign key for author_id
        $this->addForeignKey(
            'fk-events-author_id',
            '{{%events}}',
            'author_id',
            '{{%user}}',
            'id',
            'CASCADE'
        );

        // Add indexes
        $this->createIndex('idx-events-status', '{{%events}}', 'status');
        $this->createIndex('idx-events-event_date', '{{%events}}', 'event_date');

        // Insert sample events
        $this->insert('{{%events}}', [
            'title' => 'Annual Day Celebration',
            'description' => 'Join us for our grand Annual Day celebration featuring cultural performances, awards ceremony, and special presentations by our talented students.',
            'location' => 'School Auditorium',
            'event_date' => strtotime('2025-03-20 10:00:00'),
            'status' => 1,
            'author_id' => 1,
            'created_at' => time(),
            'updated_at' => time(),
        ]);

        $this->insert('{{%events}}', [
            'title' => 'Science Exhibition',
            'description' => 'Students will showcase their innovative science projects and experiments. Open to all parents and visitors.',
            'location' => 'Science Laboratory',
            'event_date' => strtotime('2025-02-15 09:00:00'),
            'status' => 1,
            'author_id' => 1,
            'created_at' => time(),
            'updated_at' => time(),
        ]);

        $this->insert('{{%events}}', [
            'title' => 'Parent-Teacher Meeting',
            'description' => 'Monthly parent-teacher interaction session to discuss student progress and academic performance.',
            'location' => 'Classrooms',
            'event_date' => strtotime('2025-02-28 14:00:00'),
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
        $this->dropForeignKey('fk-events-author_id', '{{%events}}');
        $this->dropTable('{{%events}}');
    }
}
