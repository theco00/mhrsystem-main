import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggleButton() {
  const [isDark, setIsDark] = useState(false); // Default to light (blue & white theme)

  useEffect(() => {
    // Initialize theme
    const stored = localStorage.getItem('titan-juros-theme');
    const initialTheme = stored === 'dark' ? true : false; // Default light
    
    setIsDark(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    
    if (dark) {
      // Dark theme - Blue tones
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.85)');
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      // Light theme - White & Blue (default)
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f0f9ff');
      root.style.setProperty('--bg-tertiary', '#e0f2fe');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#334155');
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('titan-juros-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed bottom-8 right-8 z-50 group"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div 
        className="relative w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.8))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 249, 255, 0.9))',
          border: isDark 
            ? '2px solid rgba(59, 130, 246, 0.5)' 
            : '2px solid rgba(59, 130, 246, 0.4)',
          backdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? '0 0 40px rgba(59, 130, 246, 0.4)'
            : '0 0 40px rgba(59, 130, 246, 0.25)'
        }}
        animate={{
          boxShadow: isDark
            ? ['0 0 30px rgba(59, 130, 246, 0.3)', '0 0 50px rgba(59, 130, 246, 0.6)', '0 0 30px rgba(59, 130, 246, 0.3)']
            : ['0 0 30px rgba(59, 130, 246, 0.15)', '0 0 50px rgba(59, 130, 246, 0.3)', '0 0 30px rgba(59, 130, 246, 0.15)']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Background gradient animation */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(14, 165, 233, 0.4))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.2))'
          }} 
        />
        
        {/* Icon container with smooth transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isDark ? 'dark' : 'light'}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
            className="relative z-10"
          >
            {isDark ? (
              <Moon 
                className="w-8 h-8" 
                strokeWidth={2.5}
                style={{ 
                  color: '#60a5fa',
                  filter: 'drop-shadow(0 0 10px rgba(96, 165, 250, 1))',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round'
                }} 
              />
            ) : (
              <Sun 
                className="w-8 h-8" 
                strokeWidth={2.5}
                style={{ 
                  color: '#f59e0b',
                  filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 1))',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round'
                }} 
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Particles effect */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: isDark ? '#60a5fa' : '#3b82f6',
              left: `${30 + i * 20}%`,
              top: `${20 + i * 25}%`
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              y: [-10, 10, -10]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>
      
      {/* Tooltip melhorado com animação */}
      <motion.div 
        className="absolute bottom-full right-0 mb-4 px-5 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap"
        style={{
          background: isDark 
            ? 'rgba(30, 41, 59, 0.98)' 
            : 'rgba(255, 255, 255, 0.98)',
          border: isDark 
            ? '2px solid rgba(59, 130, 246, 0.6)' 
            : '2px solid rgba(59, 130, 246, 0.5)',
          color: isDark ? '#ffffff' : '#0f172a',
          backdropFilter: 'blur(12px)',
          boxShadow: isDark
            ? '0 0 30px rgba(59, 130, 246, 0.3)'
            : '0 0 30px rgba(59, 130, 246, 0.15)'
        }}
        initial={{ y: 10, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1, scale: 1.05 }}
      >
        <span className="text-sm font-bold flex items-center gap-2">
          {isDark ? (
            <>
              <Sun className="w-4 h-4" style={{ color: '#f59e0b' }} />
              Modo Claro
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" style={{ color: '#60a5fa' }} />
              Modo Escuro
            </>
          )}
        </span>
      </motion.div>
    </motion.button>
  );
}
