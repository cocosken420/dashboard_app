import crypto from "crypto"
import { User } from "./types"
import { getUserCookie } from "./userCookies"

const algorithm = "aes-256-gcm"

// Generate a proper 32-byte key from your secret
const rawKey = process.env.NEXT_PUBLIC_rawKey!
const secretKey = crypto.createHash("sha256").update(rawKey).digest()

// Encrypt a single field
export interface EncryptedUserSimple {
  employeeID:string
  id: string
  encryptedData: string
  iv: string
  tag: string
}

export function encryptSimple(user: User): EncryptedUserSimple|null {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  const userFromCookies = getUserCookie();
  if(!userFromCookies) throw new Error("No user cookie")
  // Stringify the entire user object (except id which we keep unencrypted for queries)
  const userData = JSON.stringify(user)
  
  let encrypted = cipher.update(userData, "utf8", "hex")
  encrypted += cipher.final("hex")
  
  const tag = cipher.getAuthTag().toString("hex")
  
  return {
    employeeID:userFromCookies?.id,
    id: user.id,
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    tag,
  }
}

// Decrypt simple approach
export function decryptSimple(encryptedData: EncryptedUserSimple): User {
  if (!encryptedData.iv || !encryptedData.tag || !encryptedData.encryptedData) {
    throw new Error("Invalid encrypted data: missing required fields")
  }
  
  const ivBuffer = Buffer.from(encryptedData.iv, "hex")
  const tagBuffer = Buffer.from(encryptedData.tag, "hex")
  
  const decipher = crypto.createDecipheriv(algorithm, secretKey, ivBuffer)
  decipher.setAuthTag(tagBuffer)
  
  let decrypted = decipher.update(encryptedData.encryptedData, "hex", "utf8")
  decrypted += decipher.final("utf8")
  
  const userData = JSON.parse(decrypted)
  
  return {
    id: encryptedData.id,
    ...userData,
  }
}