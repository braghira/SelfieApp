import { useEffect } from "react";
// components
import EventDetails from "@/components/EventDetails";
import EventForm from "@/components/EventForms";
// context
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
// hooks
import useEventsApi from "@/hooks/useEventsApi.tsx";

export default function Dashboard() {
  const { events, dispatch } = useEvents();
  const { user } = useAuth();
  const { getEvents } = useEventsApi();

  useEffect(() => {
    if (user) {
      getEvents();
    }
  }, [dispatch, user]); 

  return (
    <div className="container mb-8">
      <div className="grid sm:grid-cols-[3fr_1fr] gap-7">
        <div className="flex max-w-3xl justify-between flex-col gap-5">
          {events &&
            events.map((event) => (
              <EventDetails key={event._id} event={event} />
            ))}
        </div>
        <EventForm />
      </div>
    </div>
  );
}
