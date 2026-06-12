import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Loader2, Clock, AlertCircle, ChevronRight, Shield, Users, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showError, showSuccess } from '@/lib/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/700.css';
import onboardingBg from '@/assets/remax-onboarding-bg.jpg';

interface Mfr {
  id: string;
  name: string;
}

interface Franchise {
  id: string;
  name: string;
  active: boolean;
  team_id: string | null;
}

const RemaxOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mfrs, setMfrs] = useState<Mfr[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedMfr, setSelectedMfr] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInactiveDialog, setShowInactiveDialog] = useState(false);

  // Load MFRs on mount
  useEffect(() => {
    const loadMfrs = async () => {
      const { data, error } = await supabase
        .from('remax_mfrs')
        .select('id, name')
        .order('name');
      
      if (error) {
        showError('Erro ao carregar MFRs');
        return;
      }
      setMfrs(data || []);
      setLoading(false);
    };
    loadMfrs();
  }, []);

  // Load franchises when MFR changes
  useEffect(() => {
    if (!selectedMfr) {
      setFranchises([]);
      setSelectedFranchise('');
      return;
    }

    const loadFranchises = async () => {
      const { data, error } = await supabase
        .from('remax_franchises')
        .select('id, name, active, team_id')
        .eq('mfr_id', selectedMfr)
        .order('name');
      
      if (error) {
        showError('Erro ao carregar franquias');
        return;
      }
      setFranchises(data || []);
      setSelectedFranchise('');
    };
    loadFranchises();
  }, [selectedMfr]);

  const handleSubmit = async () => {
    if (!selectedFranchise || !user) return;

    const franchise = franchises.find(f => f.id === selectedFranchise);
    if (!franchise) return;

    if (!franchise.active || !franchise.team_id) {
      setShowInactiveDialog(true);
      return;
    }

    setSubmitting(true);
    try {
      const { data: existing } = await supabase
        .from('remax_join_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('franchise_id', selectedFranchise)
        .eq('status', 'PENDING')
        .maybeSingle();

      if (existing) {
        showError('Você já tem uma solicitação pendente para esta franquia.');
        navigate('/pending');
        return;
      }

      const { error } = await supabase
        .from('remax_join_requests')
        .insert({
          user_id: user.id,
          franchise_id: selectedFranchise,
          team_id: franchise.team_id,
          status: 'PENDING',
        });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ remax_franchise_id: selectedFranchise })
        .eq('id', user.id);

      showSuccess('Solicitação enviada! Aguarde a aprovação do gestor.');
      navigate('/pending');
    } catch (err) {
      console.error(err);
      showError('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tenant-primary)]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const stepComplete = (step: number) => {
    if (step === 1) return !!selectedMfr;
    if (step === 2) return !!selectedFranchise;
    return false;
  };

  return (
    <div className="remax-theme min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="lg:w-[45%] relative overflow-hidden flex flex-col">
        {/* Background image - fully visible */}
        <img 
          src={onboardingBg} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        {/* Gradient overlay - dark bottom for text readability, subtle top */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--tenant-primary)] via-[#003DA5]/80 to-[#003DA5]/50" />

        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 flex-1">
          {/* Spacer top */}
          <div />

          {/* Hero text */}
          <div className="py-6 lg:py-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-lg" style={{ fontFamily: "'EB Garamond', serif" }}>
              Bem-vindo à<br />
              <span className="text-4xl lg:text-5xl tracking-wide">
                <span className="text-white">AVAMA</span><span className="text-[#CC0000]">X</span>
              </span>
            </h1>
            <p className="text-white/90 text-base lg:text-lg leading-relaxed max-w-md drop-shadow-md">
              Avaliações imobiliárias inteligentes, integradas à maior rede de franquias do mundo.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4 hidden lg:block mb-8">
            <FeatureItem 
              icon={<BarChart3 className="w-4 h-4" />}
              text="Avaliações com inteligência de mercado"
            />
            <FeatureItem 
              icon={<Users className="w-4 h-4" />}
              text="Gestão colaborativa por franquia"
            />
            <FeatureItem 
              icon={<Shield className="w-4 h-4" />}
              text="Laudos com selo de autenticidade"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:w-[55%] bg-slate-50 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Configurar sua conta</h2>
            <p className="text-slate-500">
              Selecione sua regional e franquia para solicitar acesso à plataforma.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8">
            <StepIndicator number={1} active={true} complete={stepComplete(1)} />
            <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${stepComplete(1) ? 'bg-[var(--tenant-primary)]' : 'bg-slate-200'}`} />
            <StepIndicator number={2} active={!!selectedMfr} complete={stepComplete(2)} />
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 lg:p-8 space-y-7">
            {/* Step 1: MFR */}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--tenant-primary)]" />
                Master Franquia Regional (MFR)
              </Label>
              <Select value={selectedMfr} onValueChange={setSelectedMfr}>
                <SelectTrigger className={`h-12 bg-white border-slate-200 hover:border-[#003DA5]/40 transition-colors ${selectedMfr ? 'text-[var(--tenant-primary)] font-medium border-[#003DA5]/30' : 'text-slate-600'}`}>
                  <SelectValue placeholder="Selecione sua MFR" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50 border border-slate-200 shadow-lg">
                  {mfrs.map(mfr => (
                    <SelectItem key={mfr.id} value={mfr.id} className="text-slate-700 focus:bg-[var(--tenant-primary)] focus:text-white data-[state=checked]:bg-[#003DA5]/10 data-[state=checked]:text-[var(--tenant-primary)] data-[state=checked]:font-medium">
                      {mfr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-200" />

            {/* Step 2: Franchise */}
            <div className={`space-y-2.5 transition-opacity duration-300 ${selectedMfr ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--tenant-primary)]" />
                Franquia
              </Label>
              
              {selectedMfr && franchises.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    Nenhuma franquia cadastrada para esta MFR ainda. Em breve novas franquias serão adicionadas.
                  </p>
                </div>
              ) : (
                <Select 
                  value={selectedFranchise} 
                  onValueChange={setSelectedFranchise}
                  disabled={!selectedMfr}
                >
                  <SelectTrigger className={`h-12 bg-white border-slate-200 hover:border-[#003DA5]/40 transition-colors ${selectedFranchise ? 'text-[var(--tenant-primary)] font-medium border-[#003DA5]/30' : 'text-slate-600'}`}>
                    <SelectValue placeholder={selectedMfr ? "Selecione sua franquia" : "Primeiro selecione a MFR"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50 border border-slate-200 shadow-lg">
                    {franchises.map(f => (
                      <SelectItem key={f.id} value={f.id} className="text-slate-700 focus:bg-[var(--tenant-primary)] focus:text-white data-[state=checked]:bg-[#003DA5]/10 data-[state=checked]:text-[var(--tenant-primary)] data-[state=checked]:font-medium">
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedFranchise || submitting}
              className="w-full h-12 bg-[#CC0000] hover:bg-[#aa0000] text-white font-semibold shadow-lg shadow-[#CC0000]/20 hover:shadow-[#CC0000]/30 transition-all duration-200 hover:-translate-y-0.5 rounded-xl group"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando solicitação...
                </>
              ) : (
                <>
                  Solicitar Acesso
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-xs text-slate-400 text-center mt-6">
            Após a solicitação, o gestor da franquia precisará aprovar seu acesso.
          </p>
        </div>
      </div>

      {/* Inactive franchise dialog */}
      <Dialog open={showInactiveDialog} onOpenChange={setShowInactiveDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Franquia ainda não ativou o Avaluz
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Sua franquia ainda não contratou o plano Avaluz. Entre em contato com o gestor da sua franquia para solicitar a ativação.
            </DialogDescription>
          </DialogHeader>
          <Button
            variant="outline"
            onClick={() => setShowInactiveDialog(false)}
            className="mt-2 hover:bg-[#003DA5]/10 hover:text-[var(--tenant-primary)] hover:border-[#003DA5]/30"
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-white/95 drop-shadow-md">
      <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function StepIndicator({ number, active, complete }: { number: number; active: boolean; complete: boolean }) {
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
      complete
        ? 'bg-[var(--tenant-primary)] text-white shadow-md shadow-[#003DA5]/30'
        : active
          ? 'bg-[#003DA5]/10 text-[var(--tenant-primary)] border-2 border-[#003DA5]/30'
          : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
    }`}>
      {complete ? '✓' : number}
    </div>
  );
}

export default RemaxOnboarding;
