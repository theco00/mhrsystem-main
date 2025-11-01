import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import titanjurosLogo from "@/assets/titanjuros-logo.png";

/**
 * ProductDelivery - Página privada de entrega do produto
 * Acessível apenas para usuários autenticados que completaram o pagamento
 */
export default function ProductDelivery() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado para acessar esta página",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUser(user);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.15),transparent_50%)]" />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center relative z-10">
        <div className="max-w-2xl w-full">
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-fade-in">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                  <img 
                    src={titanjurosLogo} 
                    alt="TitanJuros Logo" 
                    className="w-32 h-32 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Success Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/20 border border-green-400/30 mb-6 backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Pagamento Confirmado</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Bem-vindo ao <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Titan Juros
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-xl mx-auto leading-relaxed">
              Seu acesso está liberado! Clique no botão abaixo para entrar no sistema e começar a gerenciar seus empréstimos.
            </p>

            {/* Dashboard Access Button */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="relative w-full sm:w-auto px-12 py-8 text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-2xl rounded-2xl transform transition-all duration-300 hover:scale-105 group"
              >
                <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                Acessar Dashboard
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>

            {/* User Info */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Logado como: <span className="text-gray-200 font-medium">{user?.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
