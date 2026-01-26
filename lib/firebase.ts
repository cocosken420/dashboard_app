import { getFirestore } from "firebase/firestore"
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getStorage, type FirebaseStorage } from "firebase/storage"
import type { Firestore } from "firebase/firestore"
const firebaseConfig = {
    apiKey:process.env.NEXT_PUBLIC_apiKey,
    authDomain:process.env.NEXT_PUBLIC_authDomain,
    projectId:process.env.NEXT_PUBLIC_projectId,
    storageBucket:process.env.NEXT_PUBLIC_storageBucket,
    messagingSenderId:process.env.NEXT_PUBLIC_messagingSenderId,
    appId:process.env.NEXT_PUBLIC_appId,
    measurementId:process.env.NEXT_PUBLIC_measurementId,
};
// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let provider: GoogleAuthProvider
let db: Firestore
let storage: FirebaseStorage
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      resolve(user?.getIdToken());
    });
  });
}
if (typeof window !== "undefined") {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  provider = new GoogleAuthProvider()
  db = getFirestore(app)
  storage = getStorage(app)
}

export { app, auth, provider, db, storage }
