import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "./useAxiosPrivate";
import { WorkoutSchema, WorkoutType, client_log } from "@/lib/utils";
import axios, { isAxiosError } from "axios";
import { useWorkouts } from "@/context/WorkoutContext";

export default function useWorkoutsApi() {
  const { user } = useAuth();
  const private_api = useAxiosPrivate();
  const { dispatch } = useWorkouts();

  // GET all workouts
  async function getWorkouts() {
    try {
      const response = await private_api.get("/api/workouts", {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      });

      if (response.status === 200) {
        const json = response.data;
        // parsing come array
        const parsed = WorkoutSchema.array().safeParse(json);

        if (parsed.success) {
          dispatch({ type: "SET_WORKOUTS", payload: json });
        } else {
          console.error("Error parsing workouts:", parsed.error);
        }
      } else {
        console.error("Failed to fetch workouts:", response.statusText);
      }
    } catch (error) {
      axios.isAxiosError(error)
        ? console.error(
            "An error occurred while fetching workouts:",
            error.message
          )
        : console.error("Uncaught error");
    }
  }

  // DELETE a single provided workout
  async function deleteWorkout(workout: WorkoutType) {
    try {
      const response = await private_api.delete(
        `/api/workouts/${workout._id}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      );

      // La risposta dovrebbe contenere l'oggetto cancellato
      const json = response.data;
      // Controlliamo che lo schema sia corretto con zod
      const parsed = WorkoutSchema.safeParse(json);

      if (parsed.success) {
        dispatch({ type: "DELETE_WORKOUT", payload: [json] });
        client_log("Item successfully deleted");
      } else {
        client_log("Error while validating deleted item schema");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        client_log(
          `Error during deletion of item ${workout._id}: ` + error.message
        );
      }
    }
  }

  return { getWorkouts, deleteWorkout };
}
