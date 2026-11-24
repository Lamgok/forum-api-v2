class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, isDelete,
    } = payload;

    this.id = id;
    this.content = isDelete ? '**balasan telah dihapus**' : content;
    this.date = date;
    this.username = username;
  }

  _verifyPayload(payload) {
    if (!payload || payload.id === undefined || payload.id === null
      || payload.content === undefined || payload.content === null
      || payload.date === undefined || payload.date === null
      || payload.username === undefined || payload.username === null
      || payload.isDelete === undefined || payload.isDelete === null) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const {
      id, content, date, username, isDelete,
    } = payload;

    if (typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'string'
      || typeof username !== 'string' || typeof isDelete !== 'boolean') {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default DetailReply;
