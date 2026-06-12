import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { showSuccess, showError } from '@/lib/sonner'
import { Building2, Loader2 } from 'lucide-react'

interface EnterpriseLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnterpriseLeadDialog({ open, onOpenChange }: EnterpriseLeadDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
  })

  const handleSubmit = async () => {
    if (!formData.companyName.trim() || !formData.contactName.trim() || !formData.email.trim()) {
      showError('Preencha todos os campos obrigatórios')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showError('Digite um email válido')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('leads_enterprise')
        .insert({
          company_name: formData.companyName.trim(),
          contact_name: formData.contactName.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim(),
        })

      if (error) throw error

      showSuccess('Solicitação enviada! Entraremos em contato em breve.')
      onOpenChange(false)
      setFormData({ companyName: '', contactName: '', phone: '', email: '' })
    } catch (err) {
      console.error('Error creating lead:', err)
      showError('Erro ao enviar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Plano Imobiliária
          </DialogTitle>
          <DialogDescription>
            Preencha seus dados e nossa equipe entrará em contato para oferecer a melhor solução
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da imobiliária *</Label>
            <Input
              id="company-name"
              placeholder="Ex: Imobiliária Premium"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-name">Nome do responsável *</Label>
            <Input
              id="contact-name"
              placeholder="Seu nome completo"
              value={formData.contactName}
              onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="contato@imobiliaria.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.companyName.trim() || !formData.contactName.trim() || !formData.email.trim()}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar solicitação'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
