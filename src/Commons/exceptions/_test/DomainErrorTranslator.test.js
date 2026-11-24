import DomainErrorTranslator from '../DomainErrorTranslator.js';
import InvariantError from '../InvariantError.js';

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));
  });

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });

  it.each([
    ['NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY', 'judul dan isi thread harus diisi'],
    ['NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION', 'judul dan isi thread harus berupa string'],
    ['NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY', 'isi komentar harus diisi'],
    ['NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION', 'isi komentar harus berupa string'],
    ['NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY', 'isi balasan harus diisi'],
    ['NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION', 'isi balasan harus berupa string'],
  ])('should translate %s to a client error with a message', (errorCode, message) => {
    expect(DomainErrorTranslator.translate(new Error(errorCode)))
      .toStrictEqual(new InvariantError(message));
  });
});
