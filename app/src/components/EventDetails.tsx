import { Event } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface EventDetailsProps {
  event: Event;
  deleteEvent: (event: Event) => void;
}

export default function eventDetails({
  event,
  deleteEvent,
}: EventDetailsProps) {
  async function handleDelete() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/events/` + event._id,
        { method: "DELETE" }
      );

      const json = await response.json();

      if (response.ok) {
        deleteEvent(json);
        console.log("item successfully deleted");
      } else {
        console.log("error while deleting item");
      }
    } catch (error) {
      console.log(`error during deletion of item ${event._id}: ` + error);
    }
  }

  return (
    <div className="event-details flex justify-start">
      <div className="block max-w-[18rem] rounded-lg border border-blue-800 bg-red bg-surface-dark shadow-slate-950">
        <div className="border-b-2 border-neutral-100 px-6 py-3 text-surface dark:border-white/10 dark:text-white">
          {event.title}
        </div>
        <div className="p-6">
        
          <p className="mb-2 text-base leading-tight text-secondary">
            Date: {new Date(event.date).toLocaleString()}
          </p>
          <p className="mb-2 text-base leading-tight text-secondary">
            Duration: {event.duration} hour(s)
          </p>
          {event.location && (
            <p className="mb-2 text-base leading-tight text-secondary">
              Location: {event.location}
            </p>
          )}
          {event.isRecurring && event.recurrencePattern && (
            <div className="mb-2 text-base leading-tight text-secondary">
              <p>Recurring: Yes</p>
              <p>Frequency: {event.recurrencePattern.frequency}</p>
              {event.recurrencePattern.endType === 'after' && (
                <p>Repeats: {event.recurrencePattern.occurrences} times</p>
              )}
              {event.recurrencePattern.endType === 'until' && event.recurrencePattern.endDate && (
                <p>End Date: {new Date(event.recurrencePattern.endDate).toLocaleString()}</p>
              )}
              {event.recurrencePattern.endType === 'never' && (
                <p>Repeats indefinitely</p>
              )}
              </div>
          )}
          <p className="flex justify-stretch">
            {event.createdAt}
            <Trash2
              className="hover:cursor-pointer mx-3"
              onClick={handleDelete}
            />
          </p>
        </div>
      </div>
    </div>
  );
}
