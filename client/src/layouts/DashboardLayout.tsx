import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import useActivitiesApi from "@/hooks/useActivitiesApi";
import useEventsApi from "@/hooks/useEventsApi";
import useNotes from "@/hooks/useNote";
import usePushNotification from "@/hooks/usePushNotification";
import { PomodoroType, useTimer } from "@/hooks/useTimer";
import { client_log } from "@/lib/utils";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

function DashboardLayout() {
  const { user } = useAuth();
  const { getEvents } = useEventsApi();
  const { fetchNotes } = useNotes();
  const { getActivities } = useActivitiesApi();
  const { dispatch: timerDispatch } = useTimer();
  const { subscribe, unsubscribe } = usePushNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Notification API and Service Worker are supported
    if (
      "Notification" in window &&
      navigator.serviceWorker &&
      Notification.permission === "granted"
    ) {
      // Check if the user is already subscribed
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.pushManager.getSubscription().then((subscription) => {
            if (subscription) subscribe(user?._id);
            else unsubscribe(user?._id);
          });
        })
        .catch(() => {
          unsubscribe(user?._id);
        });
    }

    // redirects to notification url
    // receive the clicked message and redirect the user based on the url provided
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
