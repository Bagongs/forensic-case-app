// src/renderer/src/hooks/useCaseLogsApi.js
import { useIpc } from './useIpc'

export function useCaseLogsApi() {
  const { invoke } = useIpc()

  return {
    listLogs: (caseId, params) => invoke('caseLogs:list', { caseId, params }),

    getDetail: (logId) => invoke('caseLogs:detail', logId),

    changeStatus: (caseId, payload) => invoke('caseLogs:changeStatus', { caseId, payload })
  }
}
