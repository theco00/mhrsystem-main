import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, TrendingUp, AlertCircle, Flame } from 'lucide-react';

export default function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  
  const [usersViewing, setUsersViewing] = useState(127);
  const [recentPurchases, setRecentPurchases] = useState(14);
  const [showNotification, setShowNotification] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset para 24 horas
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Simular visualizações ao vivo
  useEffect(() => {
    const interval = setInterval(() => {
      setUsersViewing(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Mostrar banner minimalista temporariamente
  useEffect(() => {
    // Mostra o banner após 2 segundos
    const bannerTimeout = setTimeout(() => {
      setShowBanner(true);
      // Esconde após 5 segundos
      setTimeout(() => setShowBanner(false), 5000);
    }, 2000);
    
    return () => clearTimeout(bannerTimeout);
  }, []);
  
  // Mostrar notificações de compra recente
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(true);
      setRecentPurchases(prev => prev + 1);
      setTimeout(() => setShowNotification(false), 4000);
    }, 45000); // A cada 45 segundos
    
    // Mostrar primeira notificação após 10 segundos
    const firstTimeout = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(firstTimeout);
    };
  }, []);
  
  const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Beatriz'];
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Recife'];
  
  return (
    <>
      {/* Banner minimalista temporário */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md"
          >
            <div className="bg-white/95 dark:bg-blue-950/95 backdrop-blur-xl rounded-full shadow-2xl border border-blue-200/60 dark:border-blue-800/60 px-6 py-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {usersViewing} pessoas vendo agora
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#448ed0]" />
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
                <span className="text-green-600 dark:text-green-400 font-bold">45% OFF</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notificação de compra recente */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="fixed bottom-20 left-4 z-50 max-w-xs"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-green-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {names[Math.floor(Math.random() * names.length)]} de {cities[Math.floor(Math.random() * cities.length)]}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Acabou de adquirir o TitanJuros
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                    Há {Math.floor(Math.random() * 5) + 1} minutos
                  </p>
                </div>
              </div>
              
              {/* Indicador de pessoas comprando */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {recentPurchases} vendas nas últimas 2 horas
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
