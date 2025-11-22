// src/renderer/src/hooks/useIpc.js

export function useIpc() {
  async function invoke(channel, args) {
    try {
      const result = await window.api.invoke(channel, args)
      if (result?.error) {
        throw new Error(result.message || 'IPC Error')
      }
      return { data: result, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return { invoke }
}
