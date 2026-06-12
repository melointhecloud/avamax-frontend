/**
 * Mapeamento de mensagens de erro do Supabase Auth para português brasileiro
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Senhas fracas
  'password is known to be weak': 'Esta senha é muito comum e fácil de adivinhar. Por favor, escolha uma senha mais segura.',
  'weak_password': 'Esta senha é muito fraca. Use letras, números e caracteres especiais.',
  'password should be at least': 'A senha deve ter pelo menos 6 caracteres.',
  
  // Senha igual à anterior
  'same_password': 'A nova senha deve ser diferente da senha atual.',
  'new password should be different': 'A nova senha deve ser diferente da senha atual.',
  
  // Login inválido
  'invalid login credentials': 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
  
  // Email não confirmado
  'email not confirmed': 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada.',
  
  // Usuário não encontrado
  'user not found': 'Usuário não encontrado.',
  
  // Cadastro duplicado
  'already registered': 'Este email já está cadastrado. Tente fazer login.',
  'user already registered': 'Este email já está cadastrado. Tente fazer login.',
  
  // Signup desabilitado
  'signup is disabled': 'O cadastro está temporariamente desabilitado.',
  'signups not allowed': 'Novos cadastros não estão permitidos no momento.',
  
  // Rate limits
  'email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'rate limit': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'too many requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'for security purposes': 'Por segurança, aguarde alguns minutos antes de tentar novamente.',
  
  // Sessão expirada
  'session_not_found': 'Sua sessão expirou. Faça login novamente.',
  'invalid_grant': 'Sessão inválida. Faça login novamente.',
  'refresh_token_not_found': 'Sua sessão expirou. Faça login novamente.',
  'session has expired': 'Sua sessão expirou. Faça login novamente.',
  
  // OAuth
  'access_denied': 'Acesso negado. Tente novamente.',
  'oauth_error': 'Erro ao conectar com o provedor. Tente novamente.',
  'provider is disabled': 'Este método de login está temporariamente desabilitado.',
  
  // Email inválido
  'invalid email': 'Email inválido. Verifique o formato do email.',
  'unable to validate email': 'Não foi possível validar o email. Verifique se está correto.',
  
  // Token inválido
  'invalid token': 'Link expirado ou inválido. Solicite um novo.',
  'token has expired': 'O link expirou. Solicite um novo.',
  
  // Rede/conexão
  'network error': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'failed to fetch': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'gateway timeout': 'O servidor de autenticação está instável no momento. Tente novamente em alguns segundos.',
  '504': 'O servidor de autenticação demorou para responder. Tente novamente em alguns segundos.',
  'service unavailable': 'Serviço de autenticação temporariamente indisponível. Tente novamente em instantes.',
  'bad gateway': 'Falha temporária no serviço de autenticação. Tente novamente em instantes.',
  'timeout_auth_flow': 'A autenticação demorou mais que o esperado. Verifique sua conexão e tente novamente.',
}

/**
 * Traduz mensagens de erro do Supabase Auth para português brasileiro
 * @param error - Erro original (string ou objeto Error)
 * @returns Mensagem traduzida em português
 */
export function translateAuthError(error: Error | string | unknown): string {
  // Extrair a mensagem do erro
  let message: string
  
  if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = (error as Error).message
  } else {
    return 'Ocorreu um erro inesperado. Tente novamente.'
  }
  
  const lowerMessage = message.toLowerCase()
  
  // Buscar correspondência parcial
  for (const [key, translation] of Object.entries(ERROR_MESSAGES)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return translation
    }
  }
  
  // Fallback genérico
  return 'Ocorreu um erro inesperado. Tente novamente.'
}
