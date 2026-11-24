class AddedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, owner } = payload;

    this.id = id;
    this.title = title;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    if (!payload || payload.id === undefined || payload.id === null
      || payload.title === undefined || payload.title === null
      || payload.owner === undefined || payload.owner === null) {
      throw new Error('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const { id, title, owner } = payload;

    if (typeof id !== 'string' || typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default AddedThread;
