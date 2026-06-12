import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile, refreshSubscription, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);
  
  const credits = searchParams.get("credits");
  const isCreditsPackage = Boolean(credits);

  useEffect(() => {
    const processPayment = async () => {
      // Wait a bit for the webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh user data
      await Promise.all([
        refreshProfile(),
        refreshSubscription(),
      ]);

      // Check if user has a team now
      if (user?.id) {
        const { data: teamMember } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (teamMember?.team_id) {
          setHasTeam(true);
        }
      }

      // Wait a bit more and refresh again to ensure webhook processed
      await new Promise(resolve => setTimeout(resolve, 1500));
      await Promise.all([
        refreshProfile(),
        refreshSubscription(),
      ]);

      setIsProcessing(false);
    };

    processPayment();
  }, [refreshProfile, refreshSubscription, user?.id]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Processando Pagamento...</CardTitle>
            <CardDescription className="text-base">
              Aguarde enquanto confirmamos sua compra.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          <CardDescription className="text-base">
            {isCreditsPackage 
              ? `Você adquiriu ${credits} créditos com sucesso.`
              : hasTeam
                ? "Sua assinatura de time foi ativada com sucesso."
                : "Sua assinatura foi ativada com sucesso."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isCreditsPackage 
              ? "Os créditos já estão disponíveis na sua conta."
              : hasTeam
                ? "Seu time foi criado automaticamente. Configure sua equipe agora!"
                : "Agora você tem acesso a todos os benefícios do seu plano."
            }
          </p>
          <div className="flex flex-col gap-2">
            {hasTeam && !isCreditsPackage ? (
              <>
                <Button onClick={() => navigate("/time")} className="w-full gap-2">
                  <Users className="w-4 h-4" />
                  Configurar Meu Time
                </Button>
                <Button variant="outline" onClick={() => navigate("/home")} className="w-full">
                  Ir para o Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate("/home")} className="w-full">
                  Ir para o Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/creditos")} className="w-full">
                  Ver Meus Créditos
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
