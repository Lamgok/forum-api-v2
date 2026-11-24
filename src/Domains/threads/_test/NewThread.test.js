import NewThread from '../entities/NewThread.js';

const validPayload = {
  title: 'A title',
  body: 'A body',
};

describe('NewThread entity', () => {
  it('should create NewThread object', () => {
    expect(new NewThread(validPayload)).toEqual(validPayload);
  });

  it.each(['title', 'body'])('should reject missing %s', (property) => {
    const payload = { ...validPayload };
    delete payload[property];

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it.each(['title', 'body'])('should reject null %s', (property) => {
    const payload = { ...validPayload, [property]: null };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it.each(['title', 'body'])('should reject a non-string %s', (property) => {
    const payload = { ...validPayload, [property]: 123 };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new NewThread()).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new NewThread(null)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should accept empty strings because they are present string values', () => {
    expect(new NewThread({ title: '', body: '' })).toEqual({ title: '', body: '' });
  });
});
