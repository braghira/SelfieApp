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
        credentials: "include",
      }
    );
    const json = await response.json();
    if (!response.ok) {
      if (json?.retryAfter) {
        const limiter_message = `Too many login attempts, retry in ${json.retryAfter} seconds`;
        setError(limiter_message);
        onError(limiter_message);
      } else {
        setError(json.error);
        onError(json.error);
        console.log(json.error);
      }
    } else {
      console.log(json);
      // save the user to local storage
      localStorage.setItem("user", JSON.stringify(json));
      // update the auth context
      dispatch({ type: "LOGIN", payload: json });
      setError("");
    }
  }

  return { login, error };
}
