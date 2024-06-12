import { useContext, useState } from "react";
import api from "@/lib/axios";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

export default function useLogin() {
  const [error, setError] = useState<string>("");
  const { dispatch } = useContext(AuthContext);

  async function login(
    email: string,
    password: string,
    onError: (error: string) => void
  ) {
    try {
      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // save the user to local storage
      localStorage.setItem("user", JSON.stringify(response.data));
      // update the auth context
      dispatch({ type: "LOGIN", payload: response.data });
      // resets form errors
      setError("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const json = error.response.data;
        if (json.retryAfter) {
          const limiterMessage = `Too many login attempts, retry in ${json.retryAfter} seconds`;
          setError(limiterMessage);
          onError(limiterMessage);
        } else {
          setError(json.error || "An unknown error occurred");
          onError(json.error || "An unknown error occurred");
          console.log(json.error);
        }
      } else {
        const errorMessage = "An unknown error occurred";
        setError(errorMessage);
        onError(errorMessage);
        console.log(error);
      }
    }
  }

  return { login, error };
}
