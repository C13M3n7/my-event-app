// src/features/shared/utils/error.ts
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
}

export function handleError(error: unknown): { message: string } {
    return {
        message: getErrorMessage(error)
    };
}