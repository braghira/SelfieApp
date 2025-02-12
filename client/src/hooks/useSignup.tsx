import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { UserType } from "@/lib/utils";
import { isAxiosError } from "axios";

export default function useSignup() {
  const [error, setError] = useState<string>("");
  const { dispatch } = useAuth();

  async function signup(user: UserType, onError: (error: string) => void) {
    try {
      const response = await api.post("/auth/signup", { ...user });

      // update the auth context
      dispatch({ type: "LOGIN", payload: response.data });

      setError("");
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const errorMessage = error.response.data;
        setError(errorMessage.error);
        onError(errorMessage.error);
      } else {
        setError("Unknown error occurred");
        onError("Unknown error occurred");
      }
    }
  }

  return { signup, error };
}
