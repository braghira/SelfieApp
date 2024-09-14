import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "./useAxiosPrivate";
import { ActivitySchema, ActivityType, client_log } from "@/lib/utils";
import axios, { isAxiosError } from "axios";
import { useActivities } from "@/context/ActivityContext";

export default function useActivitiesApi() {
  const { user } = useAuth();
  const private_api = useAxiosPrivate();
  const { dispatch } = useActivities();

  // GET all activities
  async function getActivities() {
    try {
      const response = await private_api.get("/api/activities", {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      });

      if (response.status === 200) {
        const json = response.data;
        // parsing come array
        const parsed = ActivitySchema.array().safeParse(json);

        if (parsed.success) {
          dispatch({ type: "SET_ACTIVITIES", payload: json });
        } else {
          console.error("Error parsing activities:", parsed.error);
        }
      } else {
        console.error("Failed to fetch activities:", response.statusText);
      }
    } catch (error) {
      axios.isAxiosError(error)
        ? console.error(
            "An error occurred while fetching activities:",
            error.message
          )
        : console.error("Uncaught error");
    }
  }

  // DELETE a single provided activity
  async function deleteActivity(activity: ActivityType) {
    try {
      const response = await private_api.delete(
        `/api/activities/${activity._id}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      );

      // La risposta dovrebbe contenere l'oggetto cancellato
      const json = response.data;
      // Controlliamo che lo schema sia corretto con zod
      const parsed = ActivitySchema.safeParse(json);

      if (parsed.success) {
        dispatch({ type: "DELETE_ACTIVITY", payload: [json] });
        client_log("Item successfully deleted");
      } else {
        client_log("Error while validating deleted item schema");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        client_log(
          `Error during deletion of item ${activity._id}: ` + error.message
        );
      }
    }
  }

  async function completeActivity(activity: ActivityType) {
    try {
      const response = await private_api.patch(
        `/api/activities/${activity._id}`,
        { completed: true }, // Update the activity to set completed to true
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      );

      // La risposta dovrebbe contenere l'oggetto aggiornato
      const json = response.data;
      // Controlliamo che lo schema sia corretto con zod
      const parsed = ActivitySchema.safeParse(json);

      if (parsed.success) {
        // Dispatch l'azione corretta per aggiornare l'attività
        dispatch({ type: "UPDATE_ACTIVITY", payload: json });
        client_log("Item successfully marked as completed");
      } else {
        client_log("Error while validating updated item schema");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        client_log(
          `Error during completion of item ${activity._id}: ` + error.message
        );
      }
    }
  }

  return { getActivities, deleteActivity, completeActivity };
}
