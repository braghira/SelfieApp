import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { UserType } from "@/lib/utils";
import useAxiosPrivate from "./useAxiosPrivate";

export default function useUpdateProfile() {
  const [error, setError] = useState<string>("");
  const { dispatch } = useAuth();
  const private_api = useAxiosPrivate();

  async function updateProfile(
    user: UserType,
    onError: (error: string) => void
  ) {
    try {
      // Updates Profile fields ONLY, rest is left untouched
      const response = await private_api.patch("/api/users/profile", user);

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

  return { updateProfile, error };
}
