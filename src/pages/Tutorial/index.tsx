import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Bell, 
  Search, 
  FileText, 
  CreditCard,
  ArrowRight,
  Play,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Tutorial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRemax = location.pathname.startsWith('/home');
  const iconColor = isRemax ? 'text-destructive' : 'text-primary';
  const iconBg = isRemax ? 'bg-destructive/10' : 'bg-primary/10';

  const features = [
    {
      icon: Search,
      title: 'Avaliar Imóvel',
      description: 'Faça avaliações precisas de imóveis usando nossa IA avançada. Basta preencher as informações do imóvel.',
      path: '/avaliar'
    },
    {
      icon: FileText,
      title: 'Histórico',
      description: 'Acesse todas as suas avaliações anteriores e baixe relatórios em PDF.',
      path: '/historico'
    },
    {
      icon: CreditCard,
      title: 'Créditos',
      description: 'Gerencie seus créditos e adquira mais quando precisar.',
      path: '/creditos'
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Ative notificações push para receber alertas importantes no seu dispositivo.',
      path: '/configuracoes'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Avalie um Imóvel',
      description: 'Acesse "Avaliar Imóvel" e preencha os dados como localização, área, quartos e características.',
      icon: Search
    },
    {
      number: 2,
      title: 'Aguarde a Análise',
      description: 'Nossa IA analisa o mercado e compara com imóveis similares da região.',
      icon: Sparkles
    },
    {
      number: 3,
      title: 'Receba o Resultado',
      description: 'Visualize o valor estimado, gráficos de mercado e baixe o relatório em PDF.',
      icon: FileText
    }
  ];

  return (
    <DashboardLayout title="Como Usar o AvaLuz" subtitle="Tutorial completo para aproveitar todas as funcionalidades">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* How It Works */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                <Play className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <CardTitle>Como Funciona</CardTitle>
                <CardDescription>Faça sua primeira avaliação em 3 passos simples</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
                      <step.icon className={`h-7 w-7 ${iconColor}`} />
                    </div>
                    <div className="absolute -right-2 top-5 hidden text-muted-foreground md:block">
                      {index < steps.length - 1 && <ArrowRight className="h-5 w-5" />}
                    </div>
                    <h3 className="mb-1 font-semibold">
                      {step.number}. {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate('/avaliar')} size="lg">
                <Search className="mr-2 h-4 w-4" />
                Fazer Minha Primeira Avaliação
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                <Sparkles className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <CardTitle>Funcionalidades</CardTitle>
                <CardDescription>Conheça tudo o que o AvaLuz oferece</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <button
                  key={feature.path}
                  onClick={() => navigate(feature.path)}
                  className="flex items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                    <feature.icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Dicas Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Check className={`h-3 w-3 ${iconColor}`} />
                </div>
                <span className="text-sm">
                  <strong>Seja preciso nas informações:</strong> Quanto mais detalhes você fornecer sobre o imóvel, mais precisa será a avaliação.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Check className={`h-3 w-3 ${iconColor}`} />
                </div>
                <span className="text-sm">
                  <strong>Ative as notificações:</strong> Vá em Configurações e ative as notificações push para receber alertas importantes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Check className={`h-3 w-3 ${iconColor}`} />
                </div>
                <span className="text-sm">
                  <strong>Salve seus relatórios:</strong> Baixe os PDFs das avaliações para enviar aos seus clientes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Check className={`h-3 w-3 ${iconColor}`} />
                </div>
                <span className="text-sm">
                  <strong>Gerencie seus créditos:</strong> Monitore seu saldo de créditos e recarregue antes de acabar.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                <HelpCircle className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <CardTitle>Precisa de Ajuda?</CardTitle>
                <CardDescription>Estamos aqui para ajudar você</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Se tiver dúvidas ou encontrar algum problema, acesse nossa central de ajuda.
            </p>
            <Button variant="outline" onClick={() => navigate('/ajuda')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Acessar Central de Ajuda
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Tutorial;
