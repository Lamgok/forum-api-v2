class AddedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, owner } = payload;

    this.id = id;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (!payload || payload.id === undefined || payload.id === null
      || payload.content === undefined || payload.content === null
      || payload.owner === undefined || payload.owner === null) {
      throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const { id, content, owner } = payload;

    if (typeof id !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default AddedComment;
