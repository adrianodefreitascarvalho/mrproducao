/**
 * Safe error handler that maps database errors to user-friendly messages.
 * Prevents leaking internal database structure details to the client.
 */

const ERROR_MAP: Record<string, string> = {
  '23505': 'Este registo já existe.',
  '23503': 'Não é possível remover porque está em uso.',
  '23502': 'Campos obrigatórios em falta.',
  '22P02': 'Dados inválidos fornecidos.',
  '42501': 'Sem permissões para esta operação.',
  '42P01': 'Recurso não encontrado.',
  'PGRST116': 'Registo não encontrado.',
};

export function getSafeErrorMessage(error: any, context: string): string {
  // Always log full error for debugging (server-side / dev tools)
  console.error(`[${context}]`, error);

  // In development, show the raw message for easier debugging
  if (import.meta.env.DEV) {
    return error?.message || 'Erro desconhecido.';
  }

  // Check for PostgreSQL error codes
  const pgCode = error?.code;
  if (pgCode && ERROR_MAP[pgCode]) {
    return ERROR_MAP[pgCode];
  }

  // Generic fallback - never expose raw error to users in production
  return 'Ocorreu um erro. Por favor, tente novamente.';
}
