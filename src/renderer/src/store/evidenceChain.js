// src/renderer/store/evidenceChain.js
import { create } from 'zustand'

/**
 * Satu store untuk chain-of-custody per evidence.
 * Jika kamu punya banyak evidence sekaligus, bisa tambahkan keyed by evidenceId.
 */
export const useEvidenceChain = create((set, get) => ({
  // data per stage
  acquisition: {},
  preparation: {
    investigator: '',
    location: '',
    source: '',
    type: '',
    detail: '',
    hypothesis: [''], // array string
    tool: '',
    notes: ''
  },
  extraction: {},
  analysis: {
    investigator: '',
    location: '',
    source: '',
    type: '',
    detail: '',
    analystName: '',
    hypotheses: ['', '', ''],
    tools: ['Magnet Axiom', 'Cellebrite', 'Oxygen', 'Encase'],
    results: ['', '', ''],
    summary: ''
  },

  // setter generic per stage
  setStageData: (stage, payload) => set(() => ({ [stage]: payload })),

  // --- helper khusus kebutuhanmu ---
  /**
   * Salin nilai dari Preparation → Analysis.
   * - hypothesis (Preparation) → hypotheses (Analysis)
   * - tool (Preparation) → tools[0] (Analysis) jika belum diisi
   */
  importFromPreparationToAnalysis: () => {
    const { preparation, analysis } = get()
    const next = { ...analysis }

    if (Array.isArray(preparation.hypothesis) && preparation.hypothesis.length) {
      next.hypotheses = [...preparation.hypothesis]
      // opsional: juga jadikan sebagai draft results awal
      // next.results = [...preparation.hypothesis]
    }
    if (preparation.tool && (!next.tools || !next.tools[0])) {
      next.tools = [preparation.tool, ...(next.tools?.slice(1) || [])]
    }
    set({ analysis: next })
    return next
  },

  resetAll: () =>
    set({
      acquisition: {},
      preparation: { hypothesis: [''] },
      extraction: {},
      analysis: {
        hypotheses: ['', '', ''],
        tools: ['Magnet Axiom', 'Cellebrite', 'Oxygen', 'Encase'],
        results: ['', '', ''],
        summary: ''
      }
    })
}))
