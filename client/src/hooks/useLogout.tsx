import { useWorkouts } from "@/context/WorkoutContext";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "./useAxiosPrivate";

export default function useLogout() {
  const { dispatch, setLoading } = useAuth();
  const { dispatch: workoutDispatch } = useWorkouts();
  const api = useAxiosPrivate();

  async function logout() {
    try {
      const response = await api.post("/auth/logout");

      if (response.status === 200) {
        // remove user from storage
        localStorage.removeItem("user");
        // dispatch logout action
        dispatch({ type: "LOGOUT", payload: undefined });
        // reset the workouts to an empty array
        workoutDispatch({ type: "SET_WORKOUTS", payload: [] });
        setLoading(false);
        console.log("Logout completed successfully");
      } else {
        console.error("Logout didn't complete successfully");
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  }

  return { logout };
}
