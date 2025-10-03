import { useState, useEffect } from "react";

export interface User {
  id: number;
  email: string;
  is_crew: number;
  crew_id?: number;
  [key: string]: any;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          // console.log("Logged in user details:", parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
        }
      } else {
        console.log("No user data found in localStorage");
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
