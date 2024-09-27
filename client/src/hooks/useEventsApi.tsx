import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "./useAxiosPrivate";
import { EventSchema, EventType, client_log } from "@/lib/utils";
import { isAxiosError } from "axios";
import { useEvents } from "@/context/EventContext";
import { useTimeMachineContext } from "@/context/TimeMachine";
import moment from "moment";

interface PomodoroEvent extends EventType {
  summed?: boolean;
}

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

      console.log("EVENTO pom: ", event);

      if (parsed.success) {
        dispatch({ type: "CREATE_EVENT", payload: [response.data] });
        client_log("new event added", response.data);
      } else {
        client_log("error while validating created event schema");
      }
    } catch (error) {
      if (isAxiosError(error)) client_log("an error occurred: ", error.message);
    }
  }

  // DELETE a single provided event
  async function deleteEvent(event: EventType) {
    try {
      const response = await private_api.delete(`/api/events/${event._id}`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      });

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
    try {
      const response = await private_api.get("/api/events", {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
      });

      if (response.status === 200) {
        const json: EventType[] = response.data; // Assicurati che json sia un array di eventi
        const parsed = EventSchema.array().safeParse(json);

        if (parsed.success) {
          if (parsed.data && parsed.data.length > 0) {
            const today = moment(currentDate);

            // Trova l'ultimo evento pomodoro prima di oggi
            const lastPomodoro: PomodoroEvent | undefined = parsed.data.find(
              (event) =>
                moment(event.date).isBefore(today, "day") && event.itsPomodoro
            );

            if (lastPomodoro?.currPomodoro?.cycles) {
              if (lastPomodoro.currPomodoro.cycles > 0) {
                // Trova l'evento di oggi
                const todayEvent: PomodoroEvent | undefined = parsed.data.find(
                  (event) =>
                    moment(event.date).isSame(today, "day") && event.itsPomodoro
                );

                if (todayEvent) {
                  // Somma i cicli solo se non è già stato sommato
                  if (
                    !todayEvent.summed &&
                    todayEvent?.expectedPomodoro?.cycles
                  ) {
                    todayEvent.expectedPomodoro.cycles +=
                      lastPomodoro.currPomodoro.cycles;
                    todayEvent.summed = true; // Aggiungi un flag per prevenire la somma multipla
                    updatePomodoro(todayEvent);
                  }
                } else {
                  // Se non c'è un evento per oggi, creane uno nuovo
                  const newEvent = {
                    ...lastPomodoro,
                    date: today.toISOString(),
                    currPomodoro: {
                      ...lastPomodoro.currPomodoro,
                      cycles: lastPomodoro.currPomodoro.cycles,
                    },
                    itsPomodoro: true,
                    summed: true, // Flag per indicare che i cicli sono stati sommati
                  };
                  postEvent(newEvent);
                }
              }
              return lastPomodoro;
            } else {
              console.log("No previous pomodoro event found.");
              return null;
            }
          }
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
    return null;
  }

  async function updatePomodoro(event: EventType) {
    try {
      const response = await private_api.patch(`/api/events/`, {
        event,
      });

      // should respond with updated pomodoro event
      const json = response.data;
      const parsed = EventSchema.safeParse(json);

      if (parsed.success) {
        // aggiorno lo stato globale con il nuovo evento modificato
        dispatch({ type: "UPDATE_EVENT", payload: parsed.data });
        client_log("Pomodoro event updated");

        await getEvents(); // forzo il refresh per la view calendario
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

  async function updateUserList(event: EventType) {
    try {
      const response = await private_api.patch(
        `/api/events/${event._id}`,
        {
          groupList: event.groupList.filter(
            (username) => username !== user?.username
          ),
        },
        {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        }
      );

      const json = response.data;
      const parsed = EventSchema.safeParse(json);

      if (parsed.success) {
        //aggiorno lo stato globale con il nuovo evento modificato
        dispatch({ type: "UPDATE_EVENT", payload: parsed.data });
        client_log("User successfully removed from groupList");

        await getEvents(); // forzo il refresh per la view calendario
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
    getPomodoroClosedEarly,
    getLastPomodoro,
    updateUserList,
    updatePomodoro,
  };
}
