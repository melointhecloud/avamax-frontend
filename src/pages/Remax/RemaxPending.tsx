import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import avamaxLogo from "@/assets/avamax-logo.png";

const RemaxPending = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | "NONE">("PENDING");
  const [loading, setLoading] = useState(true);
  const [franchiseName, setFranchiseName] = useState("");

  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      const { data, error } = await supabase
        .from("remax_join_requests")
        .select("status, franchise_id, remax_franchises(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setStatus("NONE");
        setLoading(false);
        return;
      }

      setStatus(data.status as typeof status);
      if (data.remax_franchises && typeof data.remax_franchises === "object" && "name" in data.remax_franchises) {
        setFranchiseName((data.remax_franchises as { name: string }).name);
      }
      setLoading(false);

      if (data.status === "APPROVED") {
        // Redirect to remax home after brief delay
        setTimeout(() => navigate("/home"), 2000);
      }
    };

    checkStatus();

    // Poll every 10 seconds
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tenant-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (status === "NONE") {
    navigate("/onboarding");
    return null;
  }

  return (
    <div className="remax-theme min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-lg border border-border p-8 text-center space-y-6">
        <img src={avamaxLogo} alt="AVAMAX" className="h-16 mx-auto" />

        {status === "PENDING" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Aguardando Aprovação</h2>
            <p className="text-slate-600 text-sm">
              Sua solicitação para ingressar na franquia{" "}
              <span className="font-semibold text-[var(--tenant-primary)]">{franchiseName}</span> foi enviada. O gestor da franquia
              irá analisar e aprovar seu acesso.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Verificando status automaticamente...
            </div>
          </>
        )}

        {status === "APPROVED" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Aprovado!</h2>
            <p className="text-slate-600 text-sm">Seu acesso foi aprovado. Redirecionando...</p>
          </>
        )}

        {status === "REJECTED" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Solicitação Recusada</h2>
            <p className="text-slate-600 text-sm">
              Sua solicitação foi recusada pelo gestor. Verifique os dados e tente novamente.
            </p>
            <Button
              onClick={() => navigate("/onboarding")}
              className="bg-[var(--tenant-primary)] hover:bg-[#002d7a] text-white"
            >
              Tentar Novamente
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default RemaxPending;
