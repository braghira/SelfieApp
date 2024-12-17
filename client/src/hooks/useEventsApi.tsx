import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "./useAxiosPrivate";
import { EventSchema, EventType, client_log } from "@/lib/utils";
import { isAxiosError } from "axios";
import { useEvents } from "@/context/EventContext";
import { useTimeMachineContext } from "@/context/TimeMachine";
import moment from "moment";

export default function useEventsApi() {
  const { user } = useAuth();
  const private_api = useAxiosPrivate();
  const { currentDate } = useTimeMachineContext();
  const { dispatch } = useEvents();

  // GET all events
  async function getEvents() {
    try {
      const response = await private_api.get("/api/events");

      if (response.status === 200) {
        const json: EventType[] = response.data; //ensure that json is an event array

        const parsed = EventSchema.array().safeParse(json);

        if (parsed.success) {
          dispatch({ type: "SET_EVENTS", payload: parsed.data });
          client_log("Time Machine Date: ", currentDate);

          // Every time we get the new events, check if there are any expired pomodoro sessions
          // Updates context and DB automatically, so it must be called after the dispatch of the events
          await updatePomodoro(parsed.data);
        } else {
          console.error("Error parsing events:", parsed.error);
        }
      } else {
        console.error("Failed to fetch events:", response.statusText);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(
          "An error occurred while fetching events:",
          error.message
        );
      } else {
        console.error("Uncaught error:", error);
      }
    }
  }

  // POST a new event
  async function postEvent(event: EventType) {
    try {
      const response = await private_api.post("/api/events", event);

      const parsed = EventSchema.safeParse(response.data);

      if (parsed.success) {
        dispatch({ type: "CREATE_EVENT", payload: [response.data] });
        client_log("new event added", response.data);

        return parsed.data;
      } else {
        client_log("error while validating created event schema");
        return undefined;
      }
    } catch (error) {
      if (isAxiosError(error))
        client_log("an error occurred while posting event: ", error.message);
      return undefined;
    }
  }

  // DELETE a single provided event
  async function deleteEvent(event: EventType) {
    try {
      const response = await private_api.delete(`/api/events/${event._id}`);

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
        client_log(
          `Error during deletion of item ${event._id}: ${error.message}`
        );
      } else {
        client_log("Uncaught error:", error);
      }
    }
  }

  /** TODO: Add a universal patch route and  */

  /**
   * Check every expired pomodoro event for incompleted cycles, if there are, add them to today's first pomodoro
   * if there's one, if not create one with default session timers
   * @param events just retrieved from server
   */
  async function updatePomodoro(events: EventType[]) {
    let cycles_sum = 0;

    events.forEach(async (e) => {
      // late pomodoro event
      if (
        e.itsPomodoro &&
        !e.expiredPomodoro &&
        moment(e.date).isBefore(currentDate, "day") &&
        e.currPomodoro?.cycles
      ) {
        // check for its unfinished cycles
        cycles_sum += e.currPomodoro.cycles;
        e.expiredPomodoro = true;
        // Update event
        await updateEvent(e);

        client_log("update in foreach", cycles_sum);
      }
    });

    // Do something only if there are late incompleted cycles
    if (cycles_sum > 0) {
      // Now add the sum to the first pomodoro of the day, if there's none, create a new pomodoro event
      let pomodoroExists = false;

      for (const e of events) {
        if (moment(e.date).isSame(currentDate, "day")) {
          // Add the incompleted cycles to today's event
          if (
            e.expectedPomodoro?.cycles &&
            e.currPomodoro?.cycles &&
            !e.expiredPomodoro
          ) {
            e.expectedPomodoro.cycles += cycles_sum;
            e.currPomodoro.cycles = e.expectedPomodoro.cycles;

            // Update event
            await updateEvent(e);

            pomodoroExists = true;
            break; // Exit the loop early if we find a match
          }
        }
      }

      client_log("pomodoro Exists: ", pomodoroExists);

      if (!pomodoroExists) {
        // create a new default session
        const timer = {
          study: 1800000,
          relax: 300000,
          cycles: cycles_sum,
        };

        const minutes = ((timer.study + timer.relax) * timer.cycles) / 60000;

        const pomodoro: EventType = {
          title: "Incompleted Pomodoro",
          date: currentDate.toISOString(),
          hours: 0,
          minutes,
          location: "",
          isRecurring: false,
          itsPomodoro: true,
          expiredPomodoro: false,
          expectedPomodoro: timer,
          currPomodoro: timer,
          groupList: [],
        };

        // POST this event to backend
        await postEvent(pomodoro);
      }
    }
  }

  async function updateEvent(event: EventType) {
    try {
      const response = await private_api.patch(`/api/events/${event._id}`, {
        ...event,
        groupList: event.groupList.filter(
          (username) => username !== user?.username
        ),
      });

      const json = response.data;
      const parsed = EventSchema.safeParse(json);

      if (parsed.success) {
        // aggiorno lo stato globale con il nuovo evento modificato
        dispatch({ type: "UPDATE_EVENT", payload: parsed.data });

        client_log("Event updated successfully");
      } else {
        client_log("Error while validating updated item schema");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        client_log(
          `Error during completion of item ${event._id}: ` + error.message,
          error.response?.data
        );
      }
    }
  }

  return {
    getEvents,
    postEvent,
    deleteEvent,
    updateEvent,
    updatePomodoro,
  };
}
