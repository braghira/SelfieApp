import useAuthContext from "./useAuthContext";
import useWorkoutContext from "./useWorkoutContext";

export default function useLogout() {
  const { dispatch } = useAuthContext();
  const { dispatch: workoutDispatch } = useWorkoutContext();

  async function logout() {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.error("Logout didn't complete successfully");
    } else {
      // remove user from storage
      localStorage.removeItem("user");
      // dispatch logout action
      dispatch({ type: "LOGOUT", payload: undefined });
      // reset the workouts to an empty array
      workoutDispatch({ type: "SET_WORKOUTS", payload: [] });
    }
  }

  return { logout };
}
