import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useAuth } from '@/contexts/AuthContext'
import { showSuccess, showError } from '@/lib/sonner'
import { Users, CreditCard, Loader2, CheckCircle2 } from 'lucide-react'

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      showError('Digite o nome do time')
      return
    }

    if (!user) {
      showError('Você precisa estar logado')
      return
    }

    setLoading(true)

    try {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          owner_id: user.id,
          name: teamName.trim(),
          plan: 'BROKER',
          seat_limit: 8,
          monthly_credits: 500,
        })
        .select()
        .single()

      if (teamError) throw teamError

      // Add owner as member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'OWNER',
        })

      if (memberError) throw memberError

      showSuccess('Time criado com sucesso!')
      onOpenChange(false)
      setTeamName('')
      navigate('/time')
    } catch (err: unknown) {
      console.error('Error creating team:', err)
      
      // Check for unique constraint violation (user already has a team)
      const errorMessage = err instanceof Error ? err.message : String(err)
      const isUniqueViolation = 
        errorMessage.includes('unique_owner_one_team') || 
        errorMessage.includes('duplicate key') ||
        errorMessage.includes('23505')
      
      if (isUniqueViolation) {
        showError('Você já possui um time. Cada usuário pode ter apenas um time.')
      } else {
        showError('Erro ao criar time. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#DF6009]" />
            Criar Time Broker
          </DialogTitle>
          <DialogDescription>
            Configure seu time e comece a gerenciar avaliações da sua equipe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Team name input */}
          <div className="space-y-2">
            <Label htmlFor="team-name">Nome do time</Label>
            <Input
              id="team-name"
              placeholder="Ex: Imobiliária Silva"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Plan summary */}
          <div className="rounded-lg border border-[#DF6009]/20 bg-[#DF6009]/5 p-4">
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Resumo do plano Broker
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[#DF6009]" />
                <span>Até <strong className="text-foreground">8 assentos</strong> no time</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[#DF6009]" />
                <span><strong className="text-foreground">500 créditos</strong> mensais compartilhados</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-[#DF6009]" />
                <span><strong className="text-foreground">R$ 497,90</strong>/mês</span>
              </li>
            </ul>
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground">
            Após criar o time, você poderá convidar corretores por email.
          </p>
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
            onClick={handleCreateTeam}
            disabled={loading || !teamName.trim()}
            className="flex-1 bg-[#DF6009] text-white hover:bg-[#DF6009]/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Time'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
