import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService, type ProfileData } from '@/services/profile.service'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const useUpdateProfile = () => {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProfileData) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return profileService.updateProfile(user.id, data)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshProfile()
      toast.success('Perfil atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao atualizar perfil')
    }
  })
}

export const useUploadAvatar = () => {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return profileService.uploadAvatar(user.id, file)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshProfile()
      toast.success('Foto atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao fazer upload da foto')
    }
  })
}

export const useDeleteAvatar = () => {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return profileService.deleteAvatar(user.id)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshProfile()
      toast.success('Foto removida')
    },
    onError: (error) => {
      console.error('Erro ao remover foto:', error)
      toast.error('Erro ao remover foto')
    }
  })
}

export const useUploadLogo = () => {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return profileService.uploadLogo(user.id, file)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshProfile()
      toast.success('Logo atualizado com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao fazer upload do logo')
    }
  })
}

export const useDeleteLogo = () => {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return profileService.deleteLogo(user.id)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshProfile()
      toast.success('Logo removido')
    },
    onError: (error) => {
      console.error('Erro ao remover logo:', error)
      toast.error('Erro ao remover logo')
    }
  })
}

export const useUploadSignature = () => {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fileOrBlob: File | Blob) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return profileService.uploadSignature(user.id, fileOrBlob)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshProfile()
      toast.success('Assinatura salva com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao salvar assinatura:', error)
      toast.error('Erro ao salvar assinatura')
    }
  })
}

export const useDeleteSignature = () => {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return profileService.deleteSignature(user.id)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshProfile()
      toast.success('Assinatura removida')
    },
    onError: (error) => {
      console.error('Erro ao remover assinatura:', error)
      toast.error('Erro ao remover assinatura')
    }
  })
}
