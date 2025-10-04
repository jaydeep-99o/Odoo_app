const TKEY = 'expman_token'
const UKEY = 'expman_user'

export const setToken = (t: string) => localStorage.setItem(TKEY, t)
export const getToken = () => localStorage.getItem(TKEY)
export const clearToken = () => { localStorage.removeItem(TKEY); localStorage.removeItem(UKEY) }

export const setUser = (u: any) => localStorage.setItem(UKEY, JSON.stringify(u))
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(UKEY) || 'null') } catch { return null }
}
