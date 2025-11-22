// src/renderer/src/hooks/usePersonsApi.js
import { useIpc } from './useIpc'

export function usePersonsApi() {
  const { invoke } = useIpc()

  return {
    createPerson: (payload) => invoke('persons:create', payload),

    updatePerson: (personId, payload) => invoke('persons:update', { personId, payload }),

    deletePerson: (personId) => invoke('persons:delete', personId)
  }
}
