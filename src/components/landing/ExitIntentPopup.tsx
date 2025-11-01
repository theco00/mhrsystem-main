import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ArrowRight, Clock } from 'lucide-react';

interface ExitIntentPopupProps {
  KIVANO_PURCHASE_URL: string;
}

function ExitIntentPopup({ KIVANO_PURCHASE_URL }: ExitIntentPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const alreadyShown = sessionStorage.getItem('exitIntentShown');
    if (alreadyShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect when mouse leaves from top of page
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Add event listener after 5 seconds (to avoid showing immediately)
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleClaim = () => {
    window.location.href = '/welcome';
    setShowPopup(false);
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-11/12 max-w-lg max-h-[90vh] mx-auto"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Content */}
              <div className="p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 mx-auto"
                >
                  <Gift className="w-8 h-8 text-white" />
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 dark:text-white text-center">
                  ⏰ Espere! Oferta Especial
                </h2>

                {/* Description */}
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-center">
                  Antes de sair, experimente com{' '}
                  <span className="font-bold text-blue-600 dark:text-blue-400">desconto exclusivo</span>!
                </p>

                {/* Offer Box */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-4 mb-4 border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">7</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Teste GRÁTIS por 7 dias
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Acesso completo. Sem cartão. Sem compromisso.
                      </p>
                      <ul className="space-y-1">
                        {[
                          'Gestão ilimitada de empréstimos',
                          'Alertas automáticos no WhatsApp',
                          'Relatórios completos',
                          'Suporte prioritário'
                        ].map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[10px]">✓</span>
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Urgency */}
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                    Oferta válida por 10 minutos!
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleClaim}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group"
                >
                  <span>Começar Teste Grátis</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust badges */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                  <span>✓ Sem cartão</span>
                  <span>✓ Cancele quando quiser</span>
                  <span>✓ 100% seguro</span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ExitIntentPopup;
