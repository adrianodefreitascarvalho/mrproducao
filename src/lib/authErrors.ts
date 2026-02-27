/**
 * Maps raw authentication error messages to safe, user-facing messages.
 * Prevents information leakage about system internals.
 */
export function getSafeAuthErrorMessage(error: any): string {
  const errorMsg = (error?.message || '').toLowerCase();

  // Prevent user enumeration
  if (errorMsg.includes('invalid login credentials') || errorMsg.includes('user not found')) {
    return 'Email ou palavra-passe incorretos.';
  }

  if (errorMsg.includes('already registered') || errorMsg.includes('already been registered')) {
    return 'Não foi possível criar a conta. Tente usar outro email.';
  }

  if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
    return 'Demasiadas tentativas. Por favor, aguarde alguns minutos.';
  }

  if (errorMsg.includes('email') && errorMsg.includes('invalid')) {
    return 'Por favor, insira um email válido.';
  }

  if (errorMsg.includes('password') && (errorMsg.includes('weak') || errorMsg.includes('short'))) {
    return 'A palavra-passe não cumpre os requisitos de segurança.';
  }

  if (errorMsg.includes('expired') || errorMsg.includes('invalid token')) {
    return 'O link expirou. Por favor, solicite um novo.';
  }

  return 'Ocorreu um erro. Por favor, tente novamente.';
}
