"use client"
import { useEffect } from "react";
import { getUserCookie } from "./userCookies";
import { useUsers } from "./useUsers";

export function useUserListener() {
  const listenToUsers = useUsers((state) => state.listenToUsers);

  useEffect(() => {
    const tryLoadUser = async () => {
      const userCookie = await getUserCookie();
      if (!userCookie?.id) return;

      listenToUsers(userCookie.id);
    };

    tryLoadUser();
  }, [listenToUsers]);
}
