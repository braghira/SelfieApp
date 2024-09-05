import { useEffect, useState } from "react";
// components
import EventDetails from "@/components/EventDetails";
import EventForm from "@/components/EventForms";
// context
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
// hooks
import useEventsApi from "@/hooks/useEventsApi.tsx";

export default function Events() {
  const { events, dispatch } = useEvents();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { getEvents } = useEventsApi();

  useEffect(() => {
    if (user) {
      getEvents();
    }
  }, [dispatch, user]); // only re render when an action is performed on a workout

  return (
    <div className="view-container mb-8">
      <div className="grid sm:grid-cols-[3fr_1fr] gap-7">
        <div className="flex max-w-3xl justify-start flex-col gap-5">
         {events &&
            events.map((event) => (
              <EventDetails key={event._id} event={event} open={open} setOpen={setOpen} />
            ))}
        </div>
        <EventForm />
      </div>
    </div>
  );
}
