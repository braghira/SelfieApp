import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "./useAxiosPrivate";
import { EventSchema, EventType, client_log } from "@/lib/utils";
import { isAxiosError } from "axios";
import { useEvents } from "@/context/EventContext";

export default function useEventsApi() {
  const { user } = useAuth();
  const private_api = useAxiosPrivate();
  const { dispatch } = useEvents();

  // GET all events
  async function getEvents() {
    try {
      const response = await private_api.get("/api/events", {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      });
  
      if (response.status === 200) {
        const json: EventType[] = response.data; // Assicurati che json sia un array di eventi
  
        const parsed = EventSchema.array().safeParse(json);
  
        if (parsed.success) {
          dispatch({ type: "SET_EVENTS", payload: parsed.data });
        } else {
          console.error("Error parsing events:", parsed.error);
        }
      } else {
        console.error("Failed to fetch events:", response.statusText);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error("An error occurred while fetching events:", error.message);
      } else {
        console.error("Uncaught error:", error);
      }
    }
  }
  
  // DELETE a single provided event
  async function deleteEvent(event: EventType) {
    try {
      const response = await private_api.delete(
        `/api/events/${event._id}`,
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      );
  
      const json = response.data;
  
      const parsed = EventSchema.safeParse(json);
  
      if (parsed.success) {
        dispatch({ type: "DELETE_EVENT", payload: [parsed.data] });
        client_log("Item successfully deleted");
      } else {
        client_log("Error while validating deleted item schema:", parsed.error);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        client_log(`Error during deletion of item ${event._id}: ${error.message}`);
      } else {
        client_log("Uncaught error:", error);
      }
    }
  }

async function getPomodoroClosedEarly() {
  const closedEarly = localStorage.getItem("closedEarly");
  if (closedEarly) {
    try {
      const parsed = JSON.parse(closedEarly);
      const { study, relax, cycles, isStudyCycle, totalTime } = parsed;
      return {
        studyInitialValue: study.initialValue,
        studyValue: study.value,
        relaxInitialValue: relax.initialValue,
        relaxValue: relax.value,
        cycles,
        isStudyCycle,
        totalTime,
      };
    } catch (error) {
      console.error("Error parsing closedEarly from localStorage:", error);
    }
  }
  return null;
}


async function getLastPomodoro() {
  const last = localStorage.getItem("lastestPomodoro");
  if (last) {
    try {
      const parsed = JSON.parse(last);
      const { study, relax, cycles, isStudyCycle, totalTime } = parsed;
      return {
        studyInitialValue: study.initialValue,
        studyValue: study.value,
        relaxInitialValue: relax.initialValue,
        relaxValue: relax.value,
        cycles,
        isStudyCycle,
        totalTime,
      };
    } catch (error) {
      console.error("Error parsing closedEarly from localStorage:", error);
    }
  }
  return null;
}


  return { getEvents, deleteEvent, getPomodoroClosedEarly, getLastPomodoro };
}
