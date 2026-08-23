export class AppError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); }
}
export const notFound = (message = '리소스를 찾을 수 없습니다.') => new AppError(404, 'NOT_FOUND', message);
