import { AlertTriangle, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TrialLimitAlertProps {
  type: 'loan' | 'client';
  currentCount: number;
  maxCount: number;
  onClose?: () => void;
}

export function TrialLimitAlert({ type, currentCount, maxCount, onClose }: TrialLimitAlertProps) {
  const navigate = useNavigate();

  const messages = {
    loan: {
      title: '🚫 Limite de Empréstimos Atingido',
      description: `Você atingiu o limite de ${maxCount} empréstimos do teste grátis.`,
      feature: 'empréstimos ilimitados'
    },
    client: {
      title: '🚫 Limite de Clientes Atingido',
      description: `Você atingiu o limite de ${maxCount} clientes do teste grátis.`,
      feature: 'clientes ilimitados'
    }
  };

  const message = messages[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {message.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {message.description}
          </p>
          
          {/* Progress */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500"
              style={{ width: '100%' }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentCount} de {maxCount} utilizados
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Faça upgrade e tenha:
              </h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>✓ {message.feature}</li>
                <li>✓ Acesso ilimitado a dispositivos</li>
                <li>✓ Todos os recursos premium</li>
                <li>✓ Suporte prioritário no WhatsApp</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Ver Planos e Fazer Upgrade
          </Button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors"
            >
              Voltar
            </button>
          )}
        </div>

        {/* Warning */}
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Você não poderá adicionar mais {type === 'loan' ? 'empréstimos' : 'clientes'} até fazer upgrade
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
