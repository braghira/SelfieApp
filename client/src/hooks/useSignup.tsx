import { useState } from "react";
import api from "@/lib/axios";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "./useAxiosPrivate";

export default function useSignup() {
  const [error, setError] = useState<string>("");
  const { dispatch } = useAuth();
  const api = useAxiosPrivate();

  async function signup(
    email: string,
    password: string,
    onError: (error: string) => void
  ) {
    try {
      const response = await api.post("/auth/signup", { email, password });

      if (response.status === 200) {
        const user = response.data;
        // save the user to local storage
        localStorage.setItem("user", JSON.stringify(user));
        // update the auth context
        dispatch({ type: "LOGIN", payload: user });
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
