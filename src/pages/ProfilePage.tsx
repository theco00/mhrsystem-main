import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Extrair informações do usuário
  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário';
  const email = user.email;
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A';
  const provider = user.app_metadata?.provider || 'Google';

  // Iniciais do nome para fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-sky-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-sky-950/30 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Meu Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Informações da sua conta Google
          </p>
        </motion.div>

        {/* Card Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-6">
                {/* Avatar Grande */}
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-blue-500 shadow-lg">
                      {getInitials(fullName)}
                    </div>
                  )}
                  
                  {/* Indicador Online */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                </div>

                {/* Nome e Email */}
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-1">
                    {fullName}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {email}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Informações da Conta */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informações da Conta
                </h3>

                {/* Grid de Informações */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Nome Completo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nome Completo
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {fullName}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-white font-medium break-all">
                        {email}
                      </p>
                    </div>
                  </div>

                  {/* Data de Criação */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Membro desde
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Provedor */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Provedor de Login
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {provider}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Aviso */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>ℹ️ Informação:</strong> Suas informações são sincronizadas automaticamente com sua conta Google. Para alterar seus dados, acesse as configurações da sua conta Google.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
