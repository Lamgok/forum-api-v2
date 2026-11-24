class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, isDelete,
    } = payload;
    const replies = payload.replies === undefined ? [] : payload.replies;
    const likeCount = payload.likeCount === undefined ? 0 : payload.likeCount;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.likeCount = likeCount;
    this.replies = replies;
  }

  _verifyPayload(payload) {
    if (!payload || payload.id === undefined || payload.id === null
      || payload.username === undefined || payload.username === null
      || payload.date === undefined || payload.date === null
      || payload.content === undefined || payload.content === null
      || payload.isDelete === undefined || payload.isDelete === null) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const {
      id, username, date, content, isDelete, likeCount,
    } = payload;
    const replies = payload.replies === undefined ? [] : payload.replies;

    if (typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'string'
      || typeof content !== 'string' || typeof isDelete !== 'boolean' || !Array.isArray(replies)
      || (likeCount !== undefined && (!Number.isInteger(likeCount) || likeCount < 0))) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default DetailComment;
