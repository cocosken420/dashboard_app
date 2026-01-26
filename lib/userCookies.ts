import Cookies from "js-cookie"



const COOKIE_KEY = "userData"
export interface CookieInterface {
  id: string
  name: string
  authMethod:"password"|"google";
  email: string
  veryfiedEmail:boolean
  phone: string
}

export const saveUserCookie = (user: CookieInterface) => {
   Cookies.set(COOKIE_KEY, JSON.stringify(user), {
    expires: 30,        // days
    secure: true,
    sameSite: "strict"
  })
}

export const getUserCookie = (): CookieInterface | null => {
  const raw = Cookies.get(COOKIE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const clearUserCookie = () => {
  Cookies.remove(COOKIE_KEY)
}
