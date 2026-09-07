import { AppError, GlobalErrorHandler, toAppError, withErrorHandling } from '../utils/errors';

describe('toAppError', () => {
  it('mempertahankan AppError apa adanya', () => {
    const original = new AppError('HTTP_ERROR', 'Server bermasalah');
    expect(toAppError(original)).toBe(original);
  });

  it('TypeError dari fetch → NETWORK_OFFLINE', () => {
    const result = toAppError(new TypeError('Network request failed'));
    expect(result.code).toBe('NETWORK_OFFLINE');
    expect(result.userMessage).toContain('koneksi');
  });

  it('AbortError → NETWORK_TIMEOUT', () => {
    const abort = new Error('The operation was aborted');
    abort.name = 'AbortError';
    const result = toAppError(abort);
    expect(result.code).toBe('NETWORK_TIMEOUT');
  });

  it('SyntaxError JSON → PARSE_ERROR', () => {
    const result = toAppError(new SyntaxError('Unexpected token'));
    expect(result.code).toBe('PARSE_ERROR');
  });

  it('non-Error (string) → UNKNOWN', () => {
    const result = toAppError('kaboom');
    expect(result.code).toBe('UNKNOWN');
  });
});

describe('withErrorHandling', () => {
  it('meneruskan hasil sukses tanpa perubahan', async () => {
    const result = await withErrorHandling(async () => 42);
    expect(result).toBe(42);
  });

  it('melempar AppError dan melapor ke GlobalErrorHandler', async () => {
    const reported: AppError[] = [];
    GlobalErrorHandler.addReporter((e) => reported.push(e));

    await expect(
      withErrorHandling(async () => {
        throw new TypeError('Network request failed');
      }, 'test-context')
    ).rejects.toMatchObject({ code: 'NETWORK_OFFLINE' });

    expect(reported).toHaveLength(1);
    expect(reported[0].code).toBe('NETWORK_OFFLINE');
    GlobalErrorHandler.clear();
  });
});

describe('GlobalErrorHandler', () => {
  it('menyimpan last error dan bisa di-clear', () => {
    const error = new AppError('UNKNOWN', 'tes');
    GlobalErrorHandler.report(error, 'unit-test');
    expect(GlobalErrorHandler.getLast()).toBe(error);
    GlobalErrorHandler.clear();
    expect(GlobalErrorHandler.getLast()).toBeNull();
  });
});
