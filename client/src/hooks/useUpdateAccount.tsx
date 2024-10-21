import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "./useAxiosPrivate";
import { AccountType, client_log } from "@/lib/utils";

export default function useUpdateAccount() {
  const [error, setError] = useState<string>("");
  const { dispatch } = useAuth();
  const private_api = useAxiosPrivate();
  const { user } = useAuth();

  async function updateAccount(
    account: AccountType,
    onError: (error: string) => void
  ) {
    try {
      // Updates Account fields ONLY(password), rest is left untouched
      const response = await private_api.patch("/api/users/account", {
        ...account,
        _id: user?._id,
      });

      // update the auth context
      dispatch({ type: "LOGIN", payload: response.data });

      setError("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data;
        client_log("Account Error: ", errorMessage);
        setError(errorMessage.error);
        onError(errorMessage.error);
      } else {
        setError("Unknown error occurred");
        onError("Unknown error occurred");
      }
    }
  }

  return { updateAccount, error };
}
