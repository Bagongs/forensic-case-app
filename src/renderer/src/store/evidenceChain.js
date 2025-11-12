import { create } from 'zustand'

export const STAGES = {
  ACQUISITION: 'acquisition',
  PREPARATION: 'preparation',
  EXTRACTION: 'extraction',
  ANALYSIS: 'analysis'
}

export const useEvidenceChain = create((set, get) => ({
  acquisition: {},
  preparation: {},
  extraction: {},
  analysis: {},

  setStageData: (stage, payload) => {
    const enriched = {
      ...payload,
      id: payload?.id || crypto.randomUUID(),
      stage: stage,
      createdAt: payload?.createdAt || new Date().toISOString()
    }

    set({ [stage]: enriched })

    try {
      const data = JSON.parse(localStorage.getItem('evidenceChain') || '{}')
      data[stage] = enriched
      localStorage.setItem('evidenceChain', JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save evidenceChain:', err)
    }

    return enriched
  },

  resetAll: () => {
    const empty = {
      acquisition: {},
      preparation: {},
      extraction: {},
      analysis: {}
    }
    set(empty)
    localStorage.setItem('evidenceChain', JSON.stringify(empty))
  }
}))
