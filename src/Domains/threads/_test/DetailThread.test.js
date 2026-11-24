import DetailThread from '../entities/DetailThread.js';

const validPayload = {
  id: 'thread-123',
  title: 'A title',
  body: 'A body',
  date: '2026-11-17T00:00:00.000Z',
  username: 'dicoding',
  comments: [],
};

describe('DetailThread entity', () => {
  it('should create DetailThread object', () => {
    expect(new DetailThread(validPayload)).toEqual(validPayload);
  });

  it.each(['id', 'title', 'body', 'date', 'username', 'comments'])(
    'should reject missing %s',
    (property) => {
      const payload = { ...validPayload };
      delete payload[property];

      expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    },
  );

  it.each(['id', 'title', 'body', 'date', 'username', 'comments'])(
    'should reject null %s',
    (property) => {
      const payload = { ...validPayload, [property]: null };

      expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    },
  );

  it.each(['id', 'title', 'body', 'date', 'username'])(
    'should reject a non-string %s',
    (property) => {
      const payload = { ...validPayload, [property]: 123 };

      expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    },
  );

  it('should reject comments that are not an array', () => {
    expect(() => new DetailThread({ ...validPayload, comments: 'not-an-array' }))
      .toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should reject a missing payload', () => {
    expect(() => new DetailThread()).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should reject a null payload', () => {
    expect(() => new DetailThread(null)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });
});
