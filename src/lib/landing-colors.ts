// Cores da página de login aplicadas na landing page
export const landingColors = {
  // Gradientes principais (baseado na página de login)
  gradient: {
    light: 'from-[#f4f1ec] via-[#eef2f7] to-[#dbe5f4]/50',
    dark: 'from-[#050b16] via-[#0c1626] to-[#132742]/70',
  },
  
  // Cores de fundo
  background: {
    primary: '#050b16',      // Azul muito escuro
    secondary: '#0c1626',    // Azul escuro médio
    tertiary: '#132742',     // Azul escuro claro
    card: 'bg-white/95 dark:bg-slate-800/95',
    overlay: 'bg-white/10 dark:bg-slate-900/10',
  },
  
  // Cores de destaque (mantendo compatibilidade)
  accent: {
    primary: '#448ed0',      // rgba(68,142,208) - Azul principal
    secondary: '#4a90e2',    // rgba(74,144,226) - Azul secundário
    success: '#10b981',      // Verde sucesso
    warning: '#f59e0b',      // Amarelo warning
    danger: '#ef4444',       // Vermelho perigo
  },
  
  // Cores de texto
  text: {
    primary: 'text-slate-800 dark:text-slate-100',
    secondary: 'text-slate-600 dark:text-slate-300',
    muted: 'text-slate-500 dark:text-slate-400',
  },
  
  // Bordas
  border: {
    default: 'border-slate-200/60 dark:border-slate-700/60',
    light: 'border-white/20 dark:border-slate-600/40',
    accent: 'border-primary/15 dark:border-primary/25',
  },
  
  // Sombras
  shadow: {
    default: 'shadow-xl',
    card: 'shadow-2xl',
    button: 'hover:shadow-lg hover:shadow-primary/30',
  },
  
  // Efeitos especiais
  effects: {
    blur: 'backdrop-blur-sm',
    saturate: 'backdrop-saturate-150',
    glow: 'bg-[radial-gradient(circle_at_top_right,rgba(68,142,208,0.12),transparent_60%)]',
    glowDark: 'bg-[radial-gradient(circle_at_top_right,rgba(74,144,226,0.15),transparent_60%)]',
  }
};

// Classes Tailwind pré-definidas
export const landingClasses = {
  // Backgrounds
  bgGradient: 'bg-gradient-to-br from-[#f4f1ec] via-[#eef2f7] to-[#dbe5f4]/50 dark:from-[#050b16] dark:via-[#0c1626] dark:to-[#132742]/70',
  bgCard: 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm backdrop-saturate-150',
  
  // Buttons
  buttonPrimary: 'bg-gradient-to-r from-[#448ed0] to-[#4a90e2] hover:from-[#4a90e2] hover:to-[#5B9FE3] text-white',
  buttonSecondary: 'bg-white/10 dark:bg-slate-800/10 border border-white/20 dark:border-slate-700/60 hover:bg-white/20 dark:hover:bg-slate-700/20',
  buttonSuccess: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white',
  
  // Cards
  card: 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm backdrop-saturate-150 border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-2xl',
  
  // Text
  heading: 'text-slate-800 dark:text-slate-100 font-bold',
  paragraph: 'text-slate-600 dark:text-slate-300',
  muted: 'text-slate-500 dark:text-slate-400',
  
  // Effects
  glow: 'absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(68,142,208,0.12),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,144,226,0.15),transparent_60%)] pointer-events-none',
};
