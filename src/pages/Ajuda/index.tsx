import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, CreditCard, FileText } from 'lucide-react'

const faqs = [
  {
    category: 'Avaliações',
    icon: FileText,
    questions: [
      {
        question: 'Como funciona a avaliação de imóveis?',
        answer: 'Nossa plataforma utiliza inteligência artificial e uma base de dados com milhares de imóveis para calcular o valor estimado do seu imóvel. Você preenche as informações como localização, área, número de quartos e outros detalhes, e nosso sistema analisa imóveis similares na região para fornecer uma estimativa precisa.'
      },
      {
        question: 'Qual a precisão das avaliações?',
        answer: 'Nossas avaliações têm uma precisão média de 85-95%, dependendo da disponibilidade de dados na região. O sistema indica o nível de confiança de cada avaliação, que varia conforme a quantidade de imóveis comparativos encontrados.'
      },
      {
        question: 'Posso usar a avaliação como laudo oficial?',
        answer: 'A avaliação gerada pela Avaluz é uma estimativa de mercado e serve como referência. Para laudos oficiais de avaliação, recomendamos consultar um avaliador credenciado junto ao CRECI ou IBAPE.'
      },
      {
        question: 'Como baixar o PDF da avaliação?',
        answer: 'Após realizar uma avaliação, você pode baixar o PDF clicando no botão "Baixar PDF" na página de detalhes da avaliação ou no histórico. O documento inclui todas as informações do imóvel e o resultado da avaliação.'
      }
    ]
  },
  {
    category: 'Créditos',
    icon: CreditCard,
    questions: [
      {
        question: 'O que são créditos?',
        answer: 'Créditos são a moeda utilizada na plataforma para realizar avaliações. Cada avaliação consome 1 crédito. Você pode adquirir pacotes de créditos conforme sua necessidade.'
      },
      {
        question: 'Os créditos expiram?',
        answer: 'Não, os créditos adquiridos não expiram. Você pode utilizá-los quando quiser, sem prazo de validade.'
      },
      {
        question: 'Como adquirir mais créditos?',
        answer: 'Acesse a página de Créditos no menu lateral e escolha o pacote que melhor atende suas necessidades. Aceitamos diversas formas de pagamento.'
      },
      {
        question: 'Posso solicitar reembolso de créditos?',
        answer: 'Créditos já utilizados não podem ser reembolsados. Para créditos não utilizados, entre em contato com nosso suporte para análise do caso.'
      }
    ]
  },
  {
    category: 'Conta e Perfil',
    icon: HelpCircle,
    questions: [
      {
        question: 'Como alterar minha senha?',
        answer: 'Acesse Configurações no menu lateral, vá até a seção "Segurança" e clique em "Alterar". Você receberá um e-mail para confirmar a alteração de senha.'
      },
      {
        question: 'Como atualizar meus dados cadastrais?',
        answer: 'Na página de Configurações, você pode atualizar seu nome, telefone, CRECI e informações da imobiliária. Lembre-se de salvar as alterações após editar.'
      },
      {
        question: 'Posso excluir minha conta?',
        answer: 'Sim, você pode solicitar a exclusão da sua conta na página de Configurações, seção "Segurança". Essa ação é irreversível e todos os seus dados serão removidos permanentemente.'
      }
    ]
  }
]

const Ajuda = () => {
  return (
    <DashboardLayout title="Ajuda" subtitle="Tire suas dúvidas">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Central de Ajuda</h1>
          <p className="text-muted-foreground">
            Encontre respostas para as perguntas mais frequentes
          </p>
        </div>

        {/* FAQ Sections */}
        {faqs.map((section) => (
          <Card key={section.category}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <section.icon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle>{section.category}</CardTitle>
                  <CardDescription>
                    {section.questions.length} perguntas frequentes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}

      </div>
    </DashboardLayout>
  )
}

export default Ajuda
