import { create } from "zustand";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { User } from "./types";
import { decryptSimple, EncryptedUserSimple } from "./crypto";

interface UserStore {
  users: User[];
  isLoaded: boolean;
  unsubscribe?: () => void;
  listenToUsers: (id: string) => void;
}

export const useUsers = create<UserStore>((set, get) => ({
  users: [],
  isLoaded: false,
  unsubscribe: undefined,

  listenToUsers: (id: string) => {
    if (!id) return;

    // unsubscribe previous listener if exists
    if (get().unsubscribe) {
      get().unsubscribe!();
      set({ unsubscribe: undefined, users: [], isLoaded: false });
    }

    const q = query(collection(db, "users"), where("employeeID", "==", id));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((snap) => {
        const userData = snap.data() as EncryptedUserSimple;
        const decrypted = decryptSimple(userData);
        return { ...decrypted, id: snap.id } as User;
      });

      set({ users: data, isLoaded: true });
    });

    set({ unsubscribe: unsub });
  },
}));
