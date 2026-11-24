class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content } = payload;

    this.content = content;
  }

  _verifyPayload(payload) {
    if (!payload || payload.content === undefined || payload.content === null) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof payload.content !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default NewComment;
