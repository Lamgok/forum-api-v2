import AddedThread from '../entities/AddedThread.js';

const validPayload = {
  id: 'thread-123',
  title: 'A title',
  owner: 'user-123',
};

describe('AddedThread entity', () => {
  it('should create AddedThread object', () => {
    expect(new AddedThread(validPayload)).toEqual(validPayload);
  });

  it.each(['id', 'title', 'owner'])('should reject missing %s', (property) => {
    const payload = { ...validPayload };
    delete payload[property];

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it.each(['id', 'title', 'owner'])('should reject null %s', (property) => {
    const payload = { ...validPayload, [property]: null };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it.each(['id', 'title', 'owner'])('should reject a non-string %s', (property) => {
    const payload = { ...validPayload, [property]: 123 };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new AddedThread()).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new AddedThread(null)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
