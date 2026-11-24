class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, title, body, date, username, comments,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = comments;
  }

  _verifyPayload(payload) {
    if (!payload || payload.id === undefined || payload.id === null
      || payload.title === undefined || payload.title === null
      || payload.body === undefined || payload.body === null
      || payload.date === undefined || payload.date === null
      || payload.username === undefined || payload.username === null
      || payload.comments === undefined || payload.comments === null) {
      throw new Error('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const {
      id, title, body, date, username, comments,
    } = payload;

    if (typeof id !== 'string' || typeof title !== 'string' || typeof body !== 'string'
      || typeof date !== 'string' || typeof username !== 'string' || !Array.isArray(comments)) {
      throw new Error('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default DetailThread;
