export const up = (pgm) => {
  pgm.createTable('comment_likes', {
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('comment_likes', 'comment_likes_pkey', {
    primaryKey: ['comment_id', 'user_id'],
  });
};

export const down = (pgm) => {
  pgm.dropTable('comment_likes');
};
