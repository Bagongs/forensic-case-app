// src/renderer/src/hooks/useAuthApi.js
import { useIpc } from './useIpc'

export function useAuthApi() {
  const { invoke } = useIpc()

  return {
    login: (email, password) => invoke('auth:login', { email, password }),

    logout: () => invoke('auth:logout'),

    getSession: () => invoke('auth:getSession'),

    getProfile: () => invoke('auth:getProfile')
  }
}
