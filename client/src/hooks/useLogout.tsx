import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
// importing axios instance without interceptors
import api from "@/lib/axios";
import { client_log } from "@/lib/utils";

export default function useLogout() {
  const { dispatch, setLoading } = useAuth();
  const { dispatch: eventDispatch } = useEvents();

  async function logout() {
    try {
      const response = await api.post("/auth/logout");

      if (response.status === 200) {
        // dispatch logout action
        dispatch({ type: "LOGOUT", payload: undefined });
        // reset the workouts to an empty array
        eventDispatch({ type: "SET_EVENTS", payload: [] });
        setLoading(false);
        client_log("Logout completed successfully");
      } else {
        // dispatch logout action
        dispatch({ type: "LOGOUT", payload: undefined });
        // reset the workouts to an empty array
        eventDispatch({ type: "SET_EVENTS", payload: [] });
        setLoading(false);
        client_log("Logout couldn't delete old cookie since it expired");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  }

  return { logout };
}
