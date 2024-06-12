import api from "@/lib/axios";
import { useContext } from "react";
import { WorkoutContext } from "@/context/WorkoutContext";
import { AuthContext } from "@/context/AuthContext";

export default function useLogout() {
  const { dispatch } = useContext(AuthContext);
  const { dispatch: workoutDispatch } = useContext(WorkoutContext);

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
