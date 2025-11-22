// src/renderer/src/hooks/useUsersApi.js
import { useIpc } from './useIpc'

export function useUsersApi() {
  const { invoke } = useIpc()

  return {
    listUsers: (params) => invoke('users:list', params),

    createUser: (payload) => invoke('users:create', payload),

    updateUser: (userId, payload) => invoke('users:update', { userId, payload }),

    deleteUser: (userId) => invoke('users:delete', userId)
  }
}
