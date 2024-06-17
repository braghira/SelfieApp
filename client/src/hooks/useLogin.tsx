import { useState } from "react";
import { isAxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { client_log } from "@/lib/utils";

export default function useLogin() {
  const [error, setError] = useState<string>("");
  const { dispatch } = useAuth();

  async function login(
    username: string,
    password: string,
    onError: (error: string) => void
  ) {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      client_log("login api res: ", response.data);

      // update the auth context
      dispatch({ type: "LOGIN", payload: response.data });
      // resets form errors
      setError("");
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const json = error.response.data;
        if (json.retryAfter) {
          const limiterMessage = `Too many login attempts, retry in ${json.retryAfter} seconds`;
          setError(limiterMessage);
          onError(limiterMessage);
        } else {
          setError(json.error || "An unknown error occurred");
          onError(json.error || "An unknown error occurred");
          client_log(json.error);
        }
      } else {
        const errorMessage = "An unknown error occurred";
        setError(errorMessage);
        onError(errorMessage);
        isAxiosError(error) && client_log(error.message);
      }
    }
  }

  return { login, error };
}
