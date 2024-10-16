import Navbar from "@/components/Navbar";
import useActivitiesApi from "@/hooks/useActivitiesApi";
import useEventsApi from "@/hooks/useEventsApi";
import useNotes from "@/hooks/useNote";
import { PomodoroType, useTimer } from "@/hooks/useTimer";
import { client_log } from "@/lib/utils";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

function DashboardLayout() {
  const { getEvents } = useEventsApi();
  const { fetchNotes } = useNotes();
  const { getActivities } = useActivitiesApi();
  const { dispatch: timerDispatch } = useTimer();
  const navigate = useNavigate();

  // redirects to notification url
  // receive the clicked message and redirect the user based on the url provided
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        const { url, pomodoro } = event.data;
        client_log(
          `Message from service worker: ${url}, ${JSON.stringify(pomodoro)}`
        );

        // Gestione del payload pomodoro
        if (pomodoro) {
          try {
            // Verifica se pomodoro è una stringa, se no lo converte
            const parsedPomodoro =
              typeof pomodoro === "string" ? JSON.parse(pomodoro) : pomodoro;

            // sets the localstorage with the shared pomodoro
            const new_timer: PomodoroType = parsedPomodoro;
            timerDispatch({ type: "SET", payload: new_timer });
          } catch (error) {
            console.error("Failed to parse pomodoro:", error);
          }
        }

        navigate(url);
      });
    }
  }, []);

  useEffect(() => {
    // Update all contexts
    getEvents();
    getActivities();
    fetchNotes();
  }, []);

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default DashboardLayout;
