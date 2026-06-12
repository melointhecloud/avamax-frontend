import { useCallback, useEffect, useState } from 'react'
import type { AvaliarImovelFormData } from '@/validators/AvaliarImovel'

const DRAFT_KEY = 'avaluz_evaluation_draft'
const LAST_EVAL_KEY = 'avaluz_last_evaluation'
const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days (persistent draft)
const LAST_EVAL_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

interface DraftData {
  data: Partial<AvaliarImovelFormData>
  timestamp: number
}

export function useEvaluationDraft() {
  // Check localStorage synchronously on init
  const checkHasLastEvaluation = (): boolean => {
    try {
      const stored = localStorage.getItem(LAST_EVAL_KEY)
      if (stored) {
        const draft: DraftData = JSON.parse(stored)
        if (Date.now() - draft.timestamp <= LAST_EVAL_TTL) {
          return true
        } else {
          localStorage.removeItem(LAST_EVAL_KEY)
        }
      }
    } catch (e) {
      console.warn('Failed to check last evaluation:', e)
    }
    return false
  }

  const [hasLastEvaluation, setHasLastEvaluation] = useState(checkHasLastEvaluation)

  const saveDraft = useCallback((data: Partial<AvaliarImovelFormData>) => {
    const draft: DraftData = {
      data,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch (e) {
      console.warn('Failed to save draft:', e)
    }
  }, [])

  // Save as last successful evaluation (persistent in localStorage)
  const saveLastEvaluation = useCallback((data: Partial<AvaliarImovelFormData>) => {
    const draft: DraftData = {
      data,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(LAST_EVAL_KEY, JSON.stringify(draft))
      setHasLastEvaluation(true)
    } catch (e) {
      console.warn('Failed to save last evaluation:', e)
    }
  }, [])

  const loadDraft = useCallback((): Partial<AvaliarImovelFormData> | null => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY)
      if (!stored) return null
      
      const draft: DraftData = JSON.parse(stored)
      
      // Check if draft is expired
      if (Date.now() - draft.timestamp > DRAFT_TTL) {
        localStorage.removeItem(DRAFT_KEY)
        return null
      }
      
      return draft.data
    } catch (e) {
      console.warn('Failed to load draft:', e)
      return null
    }
  }, [])

  const loadLastEvaluation = useCallback((): Partial<AvaliarImovelFormData> | null => {
    try {
      const stored = localStorage.getItem(LAST_EVAL_KEY)
      if (!stored) return null
      
      const draft: DraftData = JSON.parse(stored)
      
      // Check if expired
      if (Date.now() - draft.timestamp > LAST_EVAL_TTL) {
        localStorage.removeItem(LAST_EVAL_KEY)
        setHasLastEvaluation(false)
        return null
      }
      
      return draft.data
    } catch (e) {
      console.warn('Failed to load last evaluation:', e)
      return null
    }
  }, [])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      console.warn('Failed to clear draft:', e)
    }
  }, [])

  // Clean up expired drafts on mount
  useEffect(() => {
    loadDraft() // This will clear if expired
  }, [loadDraft])

  return { 
    saveDraft, 
    loadDraft, 
    clearDraft, 
    saveLastEvaluation, 
    loadLastEvaluation,
    hasLastEvaluation 
  }
}
