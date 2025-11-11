import { create } from 'zustand'

const newId = () => crypto.randomUUID?.() ?? String(Date.now())

/* ===== Helper: Build flat evidences list ===== */
const buildFlatEvidences = (cases) => {
  const list = []
  for (const c of cases || []) {
    for (const p of c.persons || []) {
      for (const e of p.evidences || []) {
        list.push({
          id: e.id,
          summary: e.summary || '',
          fileName: e.fileName,
          fileSize: e.fileSize,
          fileMime: e.fileMime,
          previewDataUrl: e.previewDataUrl || null,
          source: e.source || (String(e.id).startsWith('E-') ? 'generated' : 'manual'),
          // relasi
          caseId: c.id,
          caseName: c.name,
          personId: p.id,
          personName: p.name,
          investigator: c.investigator,
          agency: c.agency,
          // tampil di table
          date: new Date(c.createdAt || Date.now()).toLocaleDateString('id-ID')
        })
      }
    }
  }
  return list
}

/* ===== Persist helpers ===== */
const STORAGE_KEY = 'cases_store_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { cases: [], evidences: [] }
    const parsed = JSON.parse(raw)
    // ✅ support dua format: { cases: [...] } dan langsung [ ... ]
    const casesData = Array.isArray(parsed) ? parsed : parsed.cases || []
    return {
      cases: casesData,
      evidences: buildFlatEvidences(casesData)
    }
  } catch {
    return { cases: [], evidences: [] }
  }
}

/* ===== Zustand Store ===== */
export const useCases = create((set, get) => ({
  ...loadFromStorage(),

  _rebuildEvidences: () => {
    const evidences = buildFlatEvidences(get().cases)
    set({ evidences })
  },

  /* ================== CASE ================== */
  addCase: (payload) => {
    const id = payload.id || newId()
    const item = {
      id,
      name: payload.name,
      description: payload.description || '',
      status: 'Open',
      agency: payload.agency || '',
      workUnit: payload.workUnit || '',
      investigator: payload.investigator || '',
      createdAt: new Date().toISOString(),
      persons: [],
      notes: [],
      logs: [
        { id: newId(), at: new Date().toISOString(), type: 'Open', by: payload.investigator || '' }
      ]
    }
    set({ cases: [item, ...(get().cases || [])] })
    get()._rebuildEvidences()
    return id
  },

  getCaseById: (id) => (get().cases || []).find((c) => c.id === id),

  updateCase: (caseId, patch, by = '') => {
    set({
      cases: (get().cases || []).map((c) => {
        if (c.id !== caseId) return c
        return {
          ...c,
          name: patch.name ?? c.name,
          description: patch.description ?? c.description,
          investigator: patch.investigator ?? c.investigator,
          logs: [
            ...c.logs,
            {
              id: newId(),
              at: new Date().toISOString(),
              type: 'Updated',
              by,
              note:
                [
                  patch.name !== undefined ? 'name' : null,
                  patch.description !== undefined ? 'description' : null,
                  patch.investigator !== undefined ? 'investigator' : null
                ]
                  .filter(Boolean)
                  .join(', ') || 'case updated'
            }
          ]
        }
      })
    })
    get()._rebuildEvidences()
  },

  addNote: (caseId, text, author = '') => {
    set({
      cases: (get().cases || []).map((c) =>
        c.id === caseId
          ? {
              ...c,
              notes: [
                ...(c.notes || []),
                { id: newId(), at: new Date().toISOString(), text, author }
              ]
            }
          : c
      )
    })
  },

  setCaseStatus: (caseId, nextStatus, note = '', by = '') => {
    set({
      cases: (get().cases || []).map((c) => {
        if (c.id !== caseId) return c
        const log = {
          id: newId(),
          at: new Date().toISOString(),
          type: nextStatus,
          by,
          note: note?.trim() || undefined
        }
        return { ...c, status: nextStatus, logs: [...(c.logs || []), log] }
      })
    })
  },

  /* ================== PERSON ================== */
  addPersonToCase: (caseId, { name, status = 'Suspect', evidence }) => {
    const pid = newId()
    set({
      cases: (get().cases || []).map((c) => {
        if (c.id !== caseId) return c
        const person = {
          id: pid,
          name: name || 'Unknown',
          status,
          evidences: evidence
            ? [
                {
                  id: evidence.id || newId(),
                  summary: evidence.summary || '',
                  fileName: evidence.fileName,
                  fileSize: evidence.fileSize,
                  fileMime: evidence.fileMime,
                  previewDataUrl: evidence.previewDataUrl || null,
                  source: evidence.source,
                  chain: evidence.chain || {
                    acquisition: [],
                    preparation: [],
                    extraction: [],
                    analysis: []
                  }
                }
              ]
            : []
        }
        return { ...c, persons: [...(c.persons || []), person] }
      })
    })
    get()._rebuildEvidences()
    return pid
  },

  updatePerson: (caseId, personId, patch, by = '') => {
    set({
      cases: (get().cases || []).map((c) => {
        if (c.id !== caseId) return c
        const persons = (c.persons || []).map((p) => (p.id === personId ? { ...p, ...patch } : p))
        return {
          ...c,
          persons,
          logs: [
            ...c.logs,
            {
              id: newId(),
              at: new Date().toISOString(),
              type: 'Updated',
              by,
              note: `person updated: ${personId}`
            }
          ]
        }
      })
    })
    get()._rebuildEvidences()
  },

  /* ================== EVIDENCE ================== */
  addEvidenceToPerson: (caseId, personId, ev) => {
    const eid = ev.id || newId()
    set({
      cases: (get().cases || []).map((c) => {
        if (c.id !== caseId) return c
        return {
          ...c,
          persons: (c.persons || []).map((p) =>
            p.id === personId
              ? {
                  ...p,
                  evidences: [
                    ...(p.evidences || []),
                    {
                      id: eid,
                      summary: ev.summary || '',
                      fileName: ev.fileName,
                      fileSize: ev.fileSize,
                      fileMime: ev.fileMime,
                      previewDataUrl: ev.previewDataUrl || null,
                      source: ev.source,
                      chain: ev.chain || {
                        acquisition: [],
                        preparation: [],
                        extraction: [],
                        analysis: []
                      }
                    }
                  ]
                }
              : p
          )
        }
      })
    })
    get()._rebuildEvidences()
    return eid
  },

  addEvidence: (caseId, personId, ev) => get().addEvidenceToPerson(caseId, personId, ev),
  updateEvidence: (evidenceId, patch) => {
    set({
      cases: (get().cases || []).map((c) => ({
        ...c,
        persons: (c.persons || []).map((p) => ({
          ...p,
          evidences: (p.evidences || []).map((e) => {
            if (e.id !== evidenceId) return e
            return {
              ...e,
              ...patch // overwrite field yg diubah
            }
          })
        }))
      }))
    })
    get()._rebuildEvidences()
  },

  getEvidenceById: (evidenceId) => {
    const cases = get().cases || []
    for (const c of cases) {
      for (const p of c.persons || []) {
        for (const e of p.evidences || []) {
          if (e.id === evidenceId) {
            return { evidence: e, caseRef: c, personRef: p }
          }
        }
      }
    }
    return null
  },

  addChainContent: (evidenceId, stage, item) => {
    const newIdVal = newId()
    set({
      cases: (get().cases || []).map((c) => ({
        ...c,
        persons: (c.persons || []).map((p) => ({
          ...p,
          evidences: (p.evidences || []).map((e) => {
            if (e.id !== evidenceId) return e
            const chain = e.chain || {
              acquisition: [],
              preparation: [],
              extraction: [],
              analysis: []
            }
            chain[stage] = [
              ...(chain[stage] || []),
              {
                id: newIdVal,
                createdAt: new Date().toISOString(),
                ...item
              }
            ]
            return { ...e, chain }
          })
        }))
      }))
    })
    get()._rebuildEvidences()
  }
}))

/* ====== Auto-save ke localStorage ====== */
useCases.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cases: state.cases }))
  } catch (err) {
    console.warn('Failed to save to localStorage', err)
  }
})
