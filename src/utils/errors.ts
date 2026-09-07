/**
 * errors.ts — GLOBAL exception/response handling (dipakai di mana pun).
 *
 * Konsep:
 * - AppError: satu tipe error bawaan app dengan kode + pesan user-friendly.
 * - toAppError(): normalisasi SEMUA error (network/HTTP/unknown) → AppError.
 * - withErrorHandling(): wrapper async generik untuk try/catch konsisten.
 * - GlobalErrorHandler: singleton logger/reporter (Sentry dsb) + last error.
 *
 * Aturan arsitektur: UI-free (tanpa import React Native) → testable Jest.
 */

export type AppErrorCode =
  | 'NETWORK_OFFLINE' // tidak ada koneksi
  | 'NETWORK_TIMEOUT' // request timeout
  | 'HTTP_ERROR' // response.status >= 400
  | 'PARSE_ERROR' // response bukan JSON valid
  | 'UNKNOWN'; // tak terduga

export class AppError extends Error {
  readonly code: AppErrorCode;
  /** Pesan siap ditampilkan ke user (Bahasa Indonesia). */
  readonly userMessage: string;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, userMessage: string, cause?: unknown) {
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.cause = cause;
  }
}

/** Pesan user per kode error. Diekspor agar layer API memakai pesan yang sama. */
export const USER_MESSAGES: Record<AppErrorCode, string> = {
  NETWORK_OFFLINE: 'Tidak ada koneksi internet. Periksa jaringan kamu.',
  NETWORK_TIMEOUT: 'Koneksi lambat. Coba lagi sebentar.',
  HTTP_ERROR: 'Server sedang bermasalah. Coba lagi nanti.',
  PARSE_ERROR: 'Data dari server tidak valid.',
  UNKNOWN: 'Terjadi kesalahan. Coba lagi.',
};

/** Normalisasi SEMUA thrown value → AppError. Aman dipanggil di catch mana pun. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof TypeError) {
    // fetch melempar TypeError saat network gagal (offline/DNS/refused)
    return new AppError('NETWORK_OFFLINE', USER_MESSAGES.NETWORK_OFFLINE, error);
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new AppError('NETWORK_TIMEOUT', USER_MESSAGES.NETWORK_TIMEOUT, error);
  }

  if (error instanceof SyntaxError) {
    return new AppError('PARSE_ERROR', USER_MESSAGES.PARSE_ERROR, error);
  }

  if (error instanceof Error) {
    return new AppError('UNKNOWN', USER_MESSAGES.UNKNOWN, error);
  }

  return new AppError('UNKNOWN', USER_MESSAGES.UNKNOWN, error);
}

/**
 * Wrapper async generik — bungkus operasi apa pun dengan handling konsisten.
 * Contoh: const tracks = await withErrorHandling(() => searchTracks(term));
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = toAppError(error);
    GlobalErrorHandler.report(appError, context);
    throw appError;
  }
}

/**
 * GlobalErrorHandler — singleton terpusat untuk logging/reporting.
 * View/ViewModel tidak perlu try-catch sendiri; cukup panggil report()
 * atau pakai withErrorHandling().
 */
type Reporter = (error: AppError, context?: string) => void;

class ErrorHandler {
  private reporters: Reporter[] = [];
  private lastError: AppError | null = null;

  /** Daftarkan reporter (mis. Sentry.captureException). Dipanggil sekali di App.tsx. */
  addReporter(reporter: Reporter): void {
    this.reporters.push(reporter);
  }

  report(error: AppError, context?: string): void {
    this.lastError = error;
    for (const report of this.reporters) {
      report(error, context);
    }
  }

  getLast(): AppError | null {
    return this.lastError;
  }

  clear(): void {
    this.lastError = null;
  }
}

export const GlobalErrorHandler = new ErrorHandler();
