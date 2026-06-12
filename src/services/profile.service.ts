import { supabase } from '@/integrations/supabase/client'

export interface ProfileData {
  nome?: string | null
  telefone?: string | null
  creci?: string | null
  imobiliaria?: string | null
  avatar_url?: string | null
  logo_imobiliaria_url?: string | null
  signature_url?: string | null
}

export const profileService = {
  async updateProfile(userId: string, data: ProfileData) {
    // Usar RPC segura em vez de update direto
    const { error } = await supabase.rpc('update_my_profile', {
      p_nome: data.nome ?? null,
      p_telefone: data.telefone ?? null,
      p_creci: data.creci ?? null,
      p_imobiliaria: data.imobiliaria ?? null,
      p_avatar_url: data.avatar_url ?? null,
      p_logo_imobiliaria_url: data.logo_imobiliaria_url ?? null,
      p_signature_url: data.signature_url ?? null,
    })

    if (error) throw error
    return true
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${userId}/profile.${fileExt}`



    // Remove avatar antigo se existir
    const { error: removeError } = await supabase.storage
      .from('avatars')
      .remove([`${userId}/profile.png`, `${userId}/profile.jpg`, `${userId}/profile.jpeg`, `${userId}/profile.webp`])

    if (removeError) {
      console.warn('[Avatar] Erro ao remover antigo (ignorando):', removeError)
    }

    // Upload novo avatar
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('[Avatar] Erro no upload:', uploadError)
      throw uploadError
    }



    // Obter URL pública com cache-busting
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`


    // Atualizar profile com nova URL via RPC segura (passa todos os params para evitar PGRST203)
    const { error: updateError, data: updateData } = await supabase.rpc('update_my_profile', {
      p_nome: null,
      p_telefone: null,
      p_creci: null,
      p_imobiliaria: null,
      p_avatar_url: urlWithCacheBuster,
      p_logo_imobiliaria_url: null,
      p_signature_url: null,
    })



    if (updateError) {
      console.error('[Avatar] Erro ao atualizar perfil:', updateError)
      throw updateError
    }

    return urlWithCacheBuster
  },

  async deleteAvatar(userId: string) {
    await supabase.storage
      .from('avatars')
      .remove([`${userId}/profile.png`, `${userId}/profile.jpg`, `${userId}/profile.jpeg`, `${userId}/profile.webp`])

    // Remover URL via RPC segura (passa todos os params para evitar PGRST203)
    const { error } = await supabase.rpc('update_my_profile', {
      p_nome: null,
      p_telefone: null,
      p_creci: null,
      p_imobiliaria: null,
      p_avatar_url: null,
      p_logo_imobiliaria_url: null,
      p_signature_url: null,
    })

    if (error) throw error
  },

  async uploadLogo(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${userId}/logo.${fileExt}`

    // Remove logo antigo se existir
    await supabase.storage
      .from('avatars')
      .remove([`${userId}/logo.png`, `${userId}/logo.jpg`, `${userId}/logo.jpeg`, `${userId}/logo.webp`])

    // Upload novo logo
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Atualizar profile com nova URL via RPC segura (passa todos os params para evitar PGRST203)
    const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`
    const { error: updateError } = await supabase.rpc('update_my_profile', {
      p_nome: null,
      p_telefone: null,
      p_creci: null,
      p_imobiliaria: null,
      p_avatar_url: null,
      p_logo_imobiliaria_url: urlWithCacheBuster,
      p_signature_url: null,
    })

    if (updateError) throw updateError

    return urlWithCacheBuster
  },

  async deleteLogo(userId: string) {
    await supabase.storage
      .from('avatars')
      .remove([`${userId}/logo.png`, `${userId}/logo.jpg`, `${userId}/logo.jpeg`, `${userId}/logo.webp`])

    // Remover URL via RPC segura (passa todos os params para evitar PGRST203)
    const { error } = await supabase.rpc('update_my_profile', {
      p_nome: null,
      p_telefone: null,
      p_creci: null,
      p_imobiliaria: null,
      p_avatar_url: null,
      p_logo_imobiliaria_url: null,
      p_signature_url: null,
    })

    if (error) throw error
  },

  async uploadSignature(userId: string, file: File | Blob): Promise<string> {
    const fileName = `${userId}/signature_${Date.now()}.png`

    // Remove assinaturas antigas
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(userId, { search: 'signature' })
    
    if (existingFiles?.length) {
      await supabase.storage
        .from('avatars')
        .remove(existingFiles.map(f => `${userId}/${f.name}`))
    }

    // Upload nova assinatura
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { 
        upsert: true,
        contentType: 'image/png'
      })

    if (uploadError) throw uploadError

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`

    // Atualizar profile via RPC
    const { error: updateError } = await supabase.rpc('update_my_profile', {
      p_nome: null,
      p_telefone: null,
      p_creci: null,
      p_imobiliaria: null,
      p_avatar_url: null,
      p_logo_imobiliaria_url: null,
      p_signature_url: urlWithCacheBuster,
    })

    if (updateError) throw updateError

    return urlWithCacheBuster
  },

  async deleteSignature(userId: string) {
    // Remover arquivos de assinatura
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(userId, { search: 'signature' })
    
    if (files?.length) {
      await supabase.storage
        .from('avatars')
        .remove(files.map(f => `${userId}/${f.name}`))
    }

    // Limpar URL no profile - passar string vazia para limpar
    // A RPC usa COALESCE(NULLIF(p_signature_url, ''), signature_url)
    // então precisamos usar um approach diferente
    const { error } = await supabase
      .from('profiles')
      .update({ signature_url: null })
      .eq('id', userId)

    if (error) throw error
  }
}
