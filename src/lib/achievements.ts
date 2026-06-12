// Definição de todas as conquistas do sistema

export type AchievementCategory = 
  | 'avaliacoes' 
  | 'metas' 
  | 'valor' 
  | 'ranking' 
  | 'conversao' 
  | 'diversidade' 
  | 'feedback' 
  | 'membros'
  | 'streak'
  | 'velocidade'
  | 'precisao'
  | 'social';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  target: number;
  tier: 1 | 2 | 3 | 4 | 5; // Nível de dificuldade para ordenação na trilha
}

// Conquistas individuais
export const USER_ACHIEVEMENTS: AchievementDefinition[] = [
  // Avaliações
  { id: 'first_evaluation', name: 'Primeira Avaliação', description: 'Realize sua primeira avaliação de imóvel', icon: '🎯', category: 'avaliacoes', target: 1, tier: 1 },
  { id: 'evaluations_5', name: 'Corretor Iniciante', description: 'Complete 5 avaliações de imóveis', icon: '📊', category: 'avaliacoes', target: 5, tier: 1 },
  { id: 'evaluations_10', name: 'Corretor Ativo', description: 'Complete 10 avaliações de imóveis', icon: '📈', category: 'avaliacoes', target: 10, tier: 2 },
  { id: 'evaluations_25', name: 'Corretor Experiente', description: 'Complete 25 avaliações de imóveis', icon: '🏅', category: 'avaliacoes', target: 25, tier: 2 },
  { id: 'evaluations_50', name: 'Corretor Expert', description: 'Complete 50 avaliações de imóveis', icon: '🥇', category: 'avaliacoes', target: 50, tier: 3 },
  { id: 'evaluations_100', name: 'Mestre Avaliador', description: 'Complete 100 avaliações de imóveis', icon: '🏆', category: 'avaliacoes', target: 100, tier: 4 },
  { id: 'evaluations_250', name: 'Lenda Avaluz', description: 'Complete 250 avaliações de imóveis', icon: '👑', category: 'avaliacoes', target: 250, tier: 5 },

  // Metas Mensais
  { id: 'first_goal', name: 'Primeira Meta', description: 'Atinja sua primeira meta mensal', icon: '🎯', category: 'metas', target: 1, tier: 1 },
  { id: 'goals_3', name: 'Meta Consistente', description: 'Atinja 3 metas mensais', icon: '🔥', category: 'metas', target: 3, tier: 2 },
  { id: 'goals_6', name: 'Meta Expert', description: 'Atinja 6 metas mensais', icon: '⭐', category: 'metas', target: 6, tier: 3 },
  { id: 'goals_12', name: 'Meta Lenda', description: 'Atinja 12 metas mensais', icon: '💎', category: 'metas', target: 12, tier: 4 },

  // Valor Avaliado
  { id: 'value_100k', name: 'R$ 100 mil', description: 'Some R$ 100.000 em imóveis avaliados', icon: '💰', category: 'valor', target: 100000, tier: 1 },
  { id: 'value_500k', name: 'R$ 500 mil', description: 'Some R$ 500.000 em imóveis avaliados', icon: '💵', category: 'valor', target: 500000, tier: 2 },
  { id: 'value_1m', name: 'R$ 1 Milhão', description: 'Some R$ 1.000.000 em imóveis avaliados', icon: '🤑', category: 'valor', target: 1000000, tier: 3 },
  { id: 'value_5m', name: 'R$ 5 Milhões', description: 'Some R$ 5.000.000 em imóveis avaliados', icon: '🏦', category: 'valor', target: 5000000, tier: 4 },
  { id: 'luxury_1', name: 'Primeiro Luxo', description: 'Avalie 1 imóvel acima de R$ 1M', icon: '💎', category: 'valor', target: 1, tier: 2 },
  { id: 'luxury_5', name: 'Especialista Luxo', description: 'Avalie 5 imóveis acima de R$ 1M', icon: '🏰', category: 'valor', target: 5, tier: 3 },
  { id: 'luxury_10', name: 'Mestre do Luxo', description: 'Avalie 10 imóveis acima de R$ 1M', icon: '👑', category: 'valor', target: 10, tier: 4 },

  // Diversidade
  { id: 'categories_3', name: 'Multi-Categoria', description: 'Avalie 3 tipos diferentes de imóveis', icon: '🏠', category: 'diversidade', target: 3, tier: 2 },
  { id: 'categories_5', name: 'Corretor Versátil', description: 'Avalie 5 tipos diferentes de imóveis', icon: '🏢', category: 'diversidade', target: 5, tier: 3 },
  { id: 'apt_expert', name: 'Expert em Aptos', description: 'Avalie 10 apartamentos', icon: '🏬', category: 'diversidade', target: 10, tier: 2 },
  { id: 'house_expert', name: 'Expert em Casas', description: 'Avalie 10 casas', icon: '🏡', category: 'diversidade', target: 10, tier: 2 },
  { id: 'land_expert', name: 'Expert em Terrenos', description: 'Avalie 5 terrenos', icon: '🌳', category: 'diversidade', target: 5, tier: 2 },
  { id: 'all_types', name: 'Mestre Universal', description: 'Avalie todos os 7 tipos de imóveis', icon: '🌟', category: 'diversidade', target: 7, tier: 4 },

  // Ranking
  { id: 'top_100', name: 'Top 100', description: 'Entre no Top 100 do ranking Avaluz', icon: '📍', category: 'ranking', target: 100, tier: 2 },
  { id: 'top_50', name: 'Top 50', description: 'Entre no Top 50 do ranking Avaluz', icon: '🎖', category: 'ranking', target: 50, tier: 3 },
  { id: 'top_10', name: 'Top 10', description: 'Entre no Top 10 do ranking Avaluz', icon: '🥉', category: 'ranking', target: 10, tier: 4 },
  { id: 'top_3', name: 'Top 3', description: 'Entre no Top 3 do ranking Avaluz', icon: '🥈', category: 'ranking', target: 3, tier: 5 },
  { id: 'top_1', name: '#1 Avaluz', description: 'Seja o primeiro do ranking Avaluz', icon: '🥇', category: 'ranking', target: 1, tier: 5 },

  // Conversão
  { id: 'first_conversion', name: 'Primeira Captação', description: 'Converta seu primeiro imóvel', icon: '✅', category: 'conversao', target: 1, tier: 1 },
  { id: 'conversions_5', name: 'Captador Ativo', description: 'Converta 5 imóveis avaliados', icon: '🔑', category: 'conversao', target: 5, tier: 2 },
  { id: 'conversions_25', name: 'Captador Expert', description: 'Converta 25 imóveis avaliados', icon: '🏠', category: 'conversao', target: 25, tier: 4 },

  // Feedback
  { id: 'feedbacks_5', name: 'Feedback Ativo', description: 'Avalie 5 relatórios de satisfação', icon: '💬', category: 'feedback', target: 5, tier: 1 },
  { id: 'feedbacks_25', name: 'Voz da Comunidade', description: 'Avalie 25 relatórios de satisfação', icon: '📢', category: 'feedback', target: 25, tier: 3 },

  // Streak (Consistência)
  { id: 'streak_7', name: 'Semana Ativa', description: '7 dias consecutivos usando a plataforma', icon: '🔥', category: 'streak', target: 7, tier: 1 },
  { id: 'streak_14', name: 'Quinzena Ativa', description: '14 dias consecutivos usando a plataforma', icon: '🔥', category: 'streak', target: 14, tier: 2 },
  { id: 'streak_30', name: 'Mês Ativo', description: '30 dias consecutivos usando a plataforma', icon: '🌟', category: 'streak', target: 30, tier: 3 },
  { id: 'streak_90', name: 'Trimestre Ativo', description: '90 dias consecutivos usando a plataforma', icon: '💫', category: 'streak', target: 90, tier: 4 },

  // Velocidade (Produtividade)
  { id: 'fast_5', name: 'Dia Produtivo', description: '5 avaliações em um único dia', icon: '⚡', category: 'velocidade', target: 5, tier: 2 },
  { id: 'fast_10', name: 'Super Produtivo', description: '10 avaliações em um único dia', icon: '⚡', category: 'velocidade', target: 10, tier: 3 },
  { id: 'weekly_20', name: 'Semana Intensa', description: '20 avaliações em uma semana', icon: '🚀', category: 'velocidade', target: 20, tier: 3 },
  { id: 'monthly_50', name: 'Mês Explosivo', description: '50 avaliações em um mês', icon: '💥', category: 'velocidade', target: 50, tier: 4 },

  // Precisão (Qualidade)
  { id: 'rating_4', name: 'Bom Avaliador', description: 'Média 4+ em 5 avaliações', icon: '⭐', category: 'precisao', target: 5, tier: 1 },
  { id: 'rating_45', name: 'Ótimo Avaliador', description: 'Média 4.5+ em 10 avaliações', icon: '⭐', category: 'precisao', target: 10, tier: 2 },
  { id: 'rating_5', name: 'Avaliador Perfeito', description: '5 avaliações nota 5', icon: '🌟', category: 'precisao', target: 5, tier: 3 },
  { id: 'perfect_10', name: 'Perfeição Máxima', description: '10 avaliações nota 5', icon: '💯', category: 'precisao', target: 10, tier: 4 },

  // Social (Engajamento)
  { id: 'first_share', name: 'Primeiro Compartilhamento', description: 'Compartilhe seu primeiro relatório', icon: '📤', category: 'social', target: 1, tier: 1 },
  { id: 'shares_10', name: 'Divulgador', description: 'Compartilhe 10 relatórios', icon: '📣', category: 'social', target: 10, tier: 2 },
  { id: 'shares_50', name: 'Influenciador', description: 'Compartilhe 50 relatórios', icon: '🌐', category: 'social', target: 50, tier: 3 },
  { id: 'influencer', name: 'Embaixador Avaluz', description: 'Compartilhe 100 relatórios', icon: '🏆', category: 'social', target: 100, tier: 4 },
];

// Conquistas de equipe
export const TEAM_ACHIEVEMENTS: AchievementDefinition[] = [
  // Avaliações do Time
  { id: 'team_evaluations_25', name: 'Time Iniciante', description: 'Equipe realizou 25 avaliações', icon: '👥', category: 'avaliacoes', target: 25, tier: 1 },
  { id: 'team_evaluations_100', name: 'Time Ativo', description: 'Equipe realizou 100 avaliações', icon: '🏢', category: 'avaliacoes', target: 100, tier: 2 },
  { id: 'team_evaluations_250', name: 'Time Experiente', description: 'Equipe realizou 250 avaliações', icon: '🏛', category: 'avaliacoes', target: 250, tier: 3 },
  { id: 'team_evaluations_500', name: 'Time Elite', description: 'Equipe realizou 500 avaliações', icon: '👑', category: 'avaliacoes', target: 500, tier: 4 },

  // Membros
  { id: 'first_member', name: 'Primeiro Membro', description: 'Convide seu primeiro membro', icon: '👤', category: 'membros', target: 1, tier: 1 },
  { id: 'members_5', name: 'Time Formado', description: 'Tenha 5 membros na equipe', icon: '👥', category: 'membros', target: 5, tier: 2 },
  { id: 'members_10', name: 'Grande Equipe', description: 'Tenha 10 membros na equipe', icon: '🏢', category: 'membros', target: 10, tier: 3 },

  // Valor do Time
  { id: 'team_value_1m', name: 'R$ 1 Milhão', description: 'Equipe avaliou R$ 1.000.000 em imóveis', icon: '💰', category: 'valor', target: 1000000, tier: 2 },
  { id: 'team_value_5m', name: 'R$ 5 Milhões', description: 'Equipe avaliou R$ 5.000.000 em imóveis', icon: '💵', category: 'valor', target: 5000000, tier: 3 },
  { id: 'team_value_10m', name: 'R$ 10 Milhões', description: 'Equipe avaliou R$ 10.000.000 em imóveis', icon: '🏦', category: 'valor', target: 10000000, tier: 4 },

  // Metas do Time
  { id: 'team_goals_aligned', name: 'Time Alinhado', description: '100% do time com metas definidas', icon: '🎯', category: 'metas', target: 100, tier: 2 },
  { id: 'team_goals_50', name: 'Meio Caminho', description: '50% do time atingiu a meta do mês', icon: '📊', category: 'metas', target: 50, tier: 2 },
  { id: 'team_goals_80', name: 'Quase Lá', description: '80% do time atingiu a meta do mês', icon: '🔥', category: 'metas', target: 80, tier: 3 },
  { id: 'team_goals_100', name: 'Meta Total', description: '100% do time atingiu a meta do mês', icon: '🏆', category: 'metas', target: 100, tier: 4 },

  // Streak Time
  { id: 'team_streak_7', name: 'Semana Ativa', description: 'Time ativo por 7 dias seguidos', icon: '🔥', category: 'streak', target: 7, tier: 2 },
  { id: 'team_streak_30', name: 'Mês Ativo', description: 'Time ativo por 30 dias seguidos', icon: '💫', category: 'streak', target: 30, tier: 3 },

  // Precisão Time
  { id: 'team_rating_4', name: 'Time Bem Avaliado', description: 'Média do time 4+ em satisfação', icon: '⭐', category: 'precisao', target: 4, tier: 2 },
  { id: 'team_rating_45', name: 'Time Excelente', description: 'Média do time 4.5+ em satisfação', icon: '🌟', category: 'precisao', target: 45, tier: 3 },

  // Velocidade Time
  { id: 'team_daily_10', name: 'Dia Produtivo', description: '10 avaliações do time em um dia', icon: '⚡', category: 'velocidade', target: 10, tier: 2 },
  { id: 'team_daily_25', name: 'Super Produtivo', description: '25 avaliações do time em um dia', icon: '🚀', category: 'velocidade', target: 25, tier: 3 },
];

export const getCategoryLabel = (category: AchievementCategory): string => {
  const labels: Record<AchievementCategory, string> = {
    avaliacoes: 'Avaliações',
    metas: 'Metas',
    valor: 'Valor',
    ranking: 'Ranking',
    conversao: 'Conversão',
    diversidade: 'Diversidade',
    feedback: 'Feedback',
    membros: 'Membros',
    streak: 'Consistência',
    velocidade: 'Produtividade',
    precisao: 'Qualidade',
    social: 'Engajamento',
  };
  return labels[category];
};

export const getCategoryColor = (category: AchievementCategory): string => {
  const colors: Record<AchievementCategory, string> = {
    avaliacoes: 'hsl(215 90% 50%)',
    metas: 'hsl(24 90% 45%)',
    valor: 'hsl(145 70% 40%)',
    ranking: 'hsl(280 70% 55%)',
    conversao: 'hsl(175 70% 40%)',
    diversidade: 'hsl(38 95% 50%)',
    feedback: 'hsl(330 70% 50%)',
    membros: 'hsl(200 70% 50%)',
    streak: 'hsl(270 70% 60%)',
    velocidade: 'hsl(185 70% 45%)',
    precisao: 'hsl(340 70% 55%)',
    social: 'hsl(30 90% 55%)',
  };
  return colors[category];
};

export const getCategoryIcon = (category: AchievementCategory): string => {
  const icons: Record<AchievementCategory, string> = {
    avaliacoes: '📊',
    metas: '🎯',
    valor: '💰',
    ranking: '🏆',
    conversao: '🔑',
    diversidade: '🏠',
    feedback: '💬',
    membros: '👥',
    streak: '🔥',
    velocidade: '⚡',
    precisao: '⭐',
    social: '🌐',
  };
  return icons[category];
};
