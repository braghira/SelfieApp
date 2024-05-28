import { useState } from "react";
import useAuthContext from "./useAuthContext";

export default function useLogin() {
  const [error, setError] = useState<string>("");
  const { dispatch } = useAuthContext();

  async function login(
    email: string,
    password: string,
    onError: (error: string) => void
  ) {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    const json = await response.json();
    if (!response.ok) {
      setError(json.error || "Unknown error occurred");
      onError(json.error || "Unknown error occurred");
    } else {
      // save the user to local storage
      localStorage.setItem("user", JSON.stringify(json));
      // update the auth context
      dispatch({ type: "LOGIN", payload: json });
      setError("");
    }
  }

  return { login, error };
}
