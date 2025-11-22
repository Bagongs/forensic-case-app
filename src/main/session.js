// src/main/session.js
import Store from 'electron-store'

const store = new Store({
  name: 'session',
  defaults: {
    user: null,
    accessToken: null,
    refreshToken: null,
    authed: false
  }
})

export function setSession({ user, accessToken, refreshToken }) {
  store.set('user', user)
  store.set('accessToken', accessToken)
  store.set('refreshToken', refreshToken)
  store.set('authed', true)
}

export function updateTokens({ accessToken, refreshToken }) {
  store.set('accessToken', accessToken)
  store.set('refreshToken', refreshToken)
}

export function clearSession() {
  store.set('user', null)
  store.set('accessToken', null)
  store.set('refreshToken', null)
  store.set('authed', false)
}

export function getSession() {
  return {
    authed: store.get('authed'),
    user: store.get('user')
  }
}

export function getTokens() {
  return {
    accessToken: store.get('accessToken'),
    refreshToken: store.get('refreshToken')
  }
}
