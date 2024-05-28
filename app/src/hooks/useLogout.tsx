import useAuthContext from "./useAuthContext";
import useWorkoutContext from "./useWorkoutContext";

export default function useLogout() {
  const { dispatch } = useAuthContext();
  const { dispatch: workoutDispatch } = useWorkoutContext();

  const logout = () => {
    // remove user from storage
    localStorage.removeItem("user");
    // dispatch logout action
    dispatch({ type: "LOGOUT", payload: undefined });
    // reset the workouts to an empty array
    workoutDispatch({ type: "SET_WORKOUTS", payload: [] });
  };

  return { logout };
}
