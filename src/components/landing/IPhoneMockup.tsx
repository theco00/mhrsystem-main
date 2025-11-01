import { motion } from 'framer-motion';
import { Check, Clock, TrendingUp, Users, Shield, Zap, Star, Bell } from 'lucide-react';

const messages = [
  {
    type: 'received',
    text: 'Oi! Gostaria de saber sobre o sistema de controle',
    time: '14:23',
    icon: Users,
    color: '#10f981'
  },
  {
    type: 'sent',
    text: '✅ Sistema completo de gestão de empréstimos!',
    time: '14:24',
    highlight: true
  },
  {
    type: 'sent',
    text: '📊 Controle total dos seus clientes',
    time: '14:24'
  },
  {
    type: 'received',
    text: 'Envia alertas automáticos?',
    time: '14:25',
    icon: Bell,
    color: '#fbbf24'
  },
  {
    type: 'sent',
    text: '🔔 Sim! WhatsApp automático para cobranças',
    time: '14:26',
    highlight: true
  },
  {
    type: 'received',
    text: 'Perfeito! Como faço para testar?',
    time: '14:27',
    icon: Star,
    color: '#4a90ff'
  },
  {
    type: 'sent',
    text: '🚀 Teste grátis por 7 dias disponível!',
    time: '14:28',
    highlight: true
  }
];

export default function IPhoneMockup() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* iPhone Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="relative"
        style={{
          width: '320px',
          height: '640px',
          perspective: '1000px'
        }}
      >
        {/* Phone Shadow */}
        <div className="absolute inset-0 bg-black/20 blur-3xl transform translate-y-10 scale-90" />
        
        {/* Phone Body */}
        <div className="relative w-full h-full rounded-[3rem] bg-gradient-to-b from-gray-900 to-gray-800 p-2 shadow-2xl"
          style={{
            boxShadow: '0 0 60px rgba(74, 144, 255, 0.3), inset 0 0 20px rgba(255,255,255,0.1)'
          }}
        >
          {/* Screen */}
          <div className="relative w-full h-full rounded-[2.5rem] bg-black overflow-hidden">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-6">
              <span className="text-white text-xs font-medium">9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-3 border border-white/60 rounded-sm">
                  <div className="w-full h-full bg-white rounded-sm scale-x-75 origin-left" />
                </div>
                <div className="w-1 h-3 bg-white/60 rounded-full" />
              </div>
            </div>
            
            {/* WhatsApp Header */}
            <div className="absolute top-8 left-0 right-0 h-16 bg-gradient-to-r from-green-600 to-green-500 z-10 flex items-center px-4 gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-lg">💼</span>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Titan Juros</h4>
                <p className="text-green-100 text-xs">Online agora</p>
              </div>
              <div className="flex gap-4">
                <Zap className="w-5 h-5 text-white" />
                <div className="w-1 h-5 bg-white/30" />
                <div className="flex flex-col gap-1">
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
            </div>
            
            {/* Messages Container */}
            <div className="absolute top-24 bottom-20 left-0 right-0 overflow-hidden">
              <div className="h-full px-3 py-2 space-y-3 overflow-y-auto">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.2, 
                      type: "spring",
                      stiffness: 200
                    }}
                    className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${message.type === 'sent' ? 'order-2' : 'order-1'}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`rounded-2xl px-4 py-2.5 shadow-lg ${
                          message.type === 'sent' 
                            ? message.highlight 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                              : 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-white/95'
                        }`}
                        style={message.highlight ? {
                          boxShadow: '0 0 20px rgba(74, 144, 255, 0.5)'
                        } : {}}
                      >
                        <div className="flex items-start gap-2">
                          {message.icon && (
                            <message.icon 
                              className="w-4 h-4 mt-0.5 flex-shrink-0" 
                              style={{ 
                                color: message.color,
                                filter: `drop-shadow(0 0 4px ${message.color})`
                              }} 
                            />
                          )}
                          <p className={`text-sm ${
                            message.type === 'sent' ? 'text-white' : 'text-gray-800'
                          } font-medium`}>
                            {message.text}
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-[10px] ${
                            message.type === 'sent' ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            {message.time}
                          </span>
                          {message.type === 'sent' && (
                            <div className="flex">
                              <Check className="w-3 h-3 text-blue-300" />
                              <Check className="w-3 h-3 text-blue-300 -ml-1.5" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: messages.length * 0.2 + 0.5 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/95 rounded-2xl px-4 py-3 shadow-lg">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Input Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 flex items-center px-4 gap-3">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2">
                <span className="text-gray-400 text-sm">Digite uma mensagem</span>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                style={{ boxShadow: '0 0 20px rgba(16, 249, 129, 0.5)' }}
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </motion.div>
            </div>
          </div>
          
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl" />
        </div>
        
        {/* Floating Badges */}
        <motion.div
          className="absolute -top-5 -right-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ boxShadow: '0 0 20px rgba(16, 249, 129, 0.6)' }}
        >
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            100% Seguro
          </span>
        </motion.div>
        
        <motion.div
          className="absolute -bottom-5 -left-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          style={{ boxShadow: '0 0 20px rgba(74, 144, 255, 0.6)' }}
        >
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +5000 Usuários
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
