class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body } = payload;

    this.title = title;
    this.body = body;
  }

  _verifyPayload(payload) {
    if (!payload || payload.title === undefined || payload.title === null
      || payload.body === undefined || payload.body === null) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const { title, body } = payload;

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default NewThread;
