import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import titanjurosLogo from '@/assets/titanjuros-logo.svg';

export default function SignUpPage() {
  const { signInWithGoogle, signUpWithEmail, isLoading } = useAuth();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================================================
  // LOGIN COM GOOGLE
  // ==========================================================================
  const handleGoogleSignUp = async () => {
    setErrors({});
    const result = await signInWithGoogle();
    if (result?.error) {
      setErrors({ general: 'Erro ao fazer cadastro com Google' });
    }
  };

  // ==========================================================================
  // CADASTRO COM EMAIL
  // ==========================================================================
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validações
    if (!formData.fullName.trim()) {
      setErrors({ fullName: 'Por favor, insira seu nome completo' });
      return;
    }
    if (!formData.email.trim()) {
      setErrors({ email: 'Por favor, insira seu email' });
      return;
    }
    if (!formData.password) {
      setErrors({ password: 'Por favor, insira uma senha' });
      return;
    }
    if (formData.password.length < 6) {
      setErrors({ password: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'As senhas não coincidem' });
      return;
    }

    const result = await signUpWithEmail(
      formData.email.trim(),
      formData.password,
      formData.fullName.trim()
    );
    
    if (result?.error) {
      setErrors({ general: result.error });
    }
  };

  // ==========================================================================
  // HANDLER DE MUDANÇA
  // ==========================================================================
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field] || errors.general) {
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-sky-50 dark:from-blue-950 dark:via-blue-900 dark:to-sky-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10 py-8">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4 relative">
            <div className="relative bg-white rounded-2xl p-3 shadow-xl border border-primary/15 hover:shadow-primary/25 transition-all duration-300 hover:scale-105">
              <img
                src={titanjurosLogo}
                alt="Logo TitanJuros"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              TitanJuros
              <span className="text-blue-600 dark:text-blue-400"> Empréstimos</span>
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
              Crie sua conta grátis
            </p>
          </div>
        </div>

        {/* SignUp Card */}
        <Card className="shadow-2xl border-blue-100/60 backdrop-blur-sm bg-white/95 dark:bg-blue-950/95 dark:border-blue-800/60 backdrop-saturate-150 rounded-xl">
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-center text-xl text-gray-900 dark:text-white font-bold">
              Cadastre-se gratuitamente
            </CardTitle>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
              Teste grátis por 7 dias
            </p>
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm mt-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              {/* Email/Password SignUp Form */}
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={errors.fullName ? 'border-red-500' : ''}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                  {errors.fullName && (
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.fullName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Digite a senha novamente"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta grátis'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-blue-950 px-2 text-gray-500 dark:text-gray-400">
                    Ou cadastre-se com
                  </span>
                </div>
              </div>

              {/* Google SignUp Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-lg"
              >
                <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </Button>

              {/* Link para Login */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Fazer login
                </Link>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                Ao continuar, você concorda com nossos Termos de Serviço e Política de
                Privacidade
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 TitanJuros. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
