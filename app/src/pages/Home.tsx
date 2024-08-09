import { useState, useEffect } from "react";

// components
import EventDetails from "@/components/EventDetails";
import EventForm from "@/components/EventForms";
import Navbar from "@/components/Navbar";
// types
import { Event } from "@/lib/utils";

export default function Home() {
  const [events, setEvents] = useState<Event[] | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/events`
      );
      const json = await response.json();

      if (response.ok) {
        setEvents(json);
      }
    };
    fetchEvents();
  }, []);

  function addEvent(newEvent: Event) {
    // Logica per aggiungere un nuovo evento
    const updatedEvents = [newEvent, ...(events || [])];
    setEvents(updatedEvents);
  }

  function deleteEvent(delEvent: Event) {
    const updatedEvents = events?.filter(
      (event) => event._id !== delEvent._id
    );
    if (updatedEvents) setEvents(updatedEvents);
    else setEvents(null);
  }

  return (
    <div className="home">
      <Navbar />
      <div className="events">
        {/* Usiamo le parentesi tonde per ritornare un template */}
        {events &&
          events.map((event) => (
            <EventDetails
              key={event._id}
              event={event}
              deleteEvent={deleteEvent}
            />
          ))}
      </div>
      <EventForm addEvent={addEvent} />
    </div>
  );
}
