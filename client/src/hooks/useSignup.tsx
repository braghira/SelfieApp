import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { UserType } from "@/lib/utils";

export default function useSignup() {
  const [error, setError] = useState<string>("");
  const { dispatch } = useAuth();

  async function signup(user: UserType, onError: (error: string) => void) {
    try {
      const response = await api.post("/auth/signup", { ...user });

      if (response.status === 200) {
        // update the auth context
        dispatch({ type: "LOGIN", payload: response.data });

        setError("");
      } else {
        const errorMessage = response.data.error || "Unknown error occurred";
        setError(errorMessage);
        onError(errorMessage);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data;
        setError(errorMessage);
        onError(errorMessage);
      } else {
        setError("Unknown error occurred");
        onError("Unknown error occurred");
      }
    }
  }

  return { signup, error };
}
