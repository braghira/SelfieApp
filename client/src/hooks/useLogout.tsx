import { useWorkouts } from "@/context/WorkoutContext";
import { useAuth } from "@/context/AuthContext";
// importing axios instance without interceptors
import api from "@/lib/axios";
import { client_log } from "@/lib/utils";

export default function useLogout() {
  const { dispatch, setLoading } = useAuth();
  const { dispatch: workoutDispatch } = useWorkouts();

  async function logout() {
    try {
      const response = await api.post("/auth/logout");

      if (response.status === 200) {
        // dispatch logout action
        dispatch({ type: "LOGOUT", payload: undefined });
        // reset the workouts to an empty array
        workoutDispatch({ type: "SET_WORKOUTS", payload: [] });
        setLoading(false);
        client_log("Logout completed successfully");
      } else {
        // dispatch logout action
        dispatch({ type: "LOGOUT", payload: undefined });
        // reset the workouts to an empty array
        workoutDispatch({ type: "SET_WORKOUTS", payload: [] });
        setLoading(false);
        console.error("Logout couldn't delete old cookie since it expired");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  }

  return { logout };
}
