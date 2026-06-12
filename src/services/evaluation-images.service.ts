import { supabase } from '@/integrations/supabase/client'

const BUCKET = 'evaluation-images'

type StorageFile = {
  name: string
  id?: string
  created_at?: string
  updated_at?: string
  last_accessed_at?: string
  metadata?: Record<string, unknown>
}

const getSignedUrl = async (path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) {
    console.error('[evaluation-images] Erro ao criar signed URL:', error)
    return null
  }
  return data.signedUrl
}

const safeList = async (path: string): Promise<StorageFile[]> => {
  const { data, error } = await supabase.storage.from(BUCKET).list(path, { limit: 100 })
  if (error) {
    console.error('[evaluation-images] Erro ao listar arquivos:', error)
    return []
  }
  return (data as unknown as StorageFile[]) || []
}

export async function uploadEvaluationCoverImage(params: {
  file: File
  userId: string
  evaluationId: number
}): Promise<string | null> {
  const { file, userId, evaluationId } = params

  const extRaw = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(extRaw) ? extRaw : 'jpg'

  const filePath = `${userId}/evaluations/${evaluationId}/cover.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  })

  if (error) {
    console.error('[evaluation-images] Erro ao fazer upload da capa:', error)
    return null
  }

  return await getSignedUrl(filePath)
}

/**
 * Resolve a foto de capa do imóvel priorizando:
 * 1) URL já salva no input (fallbackUrl)
 * 2) Arquivo no caminho determinístico: {userId}/evaluations/{evaluationId}/...
 * 3) (legado) Arquivos no root {userId}/ com nome timestamp (ex: 1700000000000.jpg)
 */
export async function resolveEvaluationCoverUrl(params: {
  userId: string
  evaluationId: number
  evaluationCreatedAt?: string
  fallbackUrl?: string | null
}): Promise<string | null> {
  const { userId, evaluationId, evaluationCreatedAt, fallbackUrl } = params

  if (fallbackUrl && typeof fallbackUrl === 'string' && fallbackUrl.startsWith('http')) {
    return fallbackUrl
  }

  // 1) Caminho determinístico
  const folder = `${userId}/evaluations/${evaluationId}`
  const deterministicFiles = await safeList(folder)

  if (deterministicFiles.length > 0) {
    const cover = deterministicFiles.find((f) => f.name.toLowerCase().startsWith('cover.'))
    const chosen = cover || deterministicFiles.sort((a, b) => b.name.localeCompare(a.name))[0]
    if (chosen?.name) {
      return await getSignedUrl(`${folder}/${chosen.name}`)
    }
  }

  // 2) Legado: root do usuário (onde o app salvava antes)
  const rootFiles = await safeList(userId)
  const candidates = rootFiles
    .filter((f) => /^\d+\.(jpg|jpeg|png|webp)$/i.test(f.name))
    .map((f) => ({
      file: f,
      ts: Number(f.name.split('.')[0]),
    }))
    .filter((x) => Number.isFinite(x.ts) && x.ts > 0)

  if (candidates.length === 0) return null

  const createdMs = evaluationCreatedAt ? new Date(evaluationCreatedAt).getTime() : null

  // Se temos a data da avaliação, pega o arquivo mais "perto" dela (boa heurística)
  if (createdMs && Number.isFinite(createdMs)) {
    candidates.sort((a, b) => Math.abs(a.ts - createdMs) - Math.abs(b.ts - createdMs))
  } else {
    // senão, pega o mais recente
    candidates.sort((a, b) => b.ts - a.ts)
  }

  const best = candidates[0]?.file
  if (!best?.name) return null

  return await getSignedUrl(`${userId}/${best.name}`)
}
