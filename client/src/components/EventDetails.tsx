// components
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
// types
import { EventType } from "@/lib/utils";
// date fns
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import useEventsApi from "@/hooks/useEventsApi.tsx";

interface EventDetailsProps {
  event: EventType;
}


export default function EventDetails({ event }: EventDetailsProps) {
  const { user } = useAuth();
  const { deleteEvent } = useEventsApi();

  async function handleDelete() {
    if (user) {
      deleteEvent(event);
    }
  }

  return (
    <Card className="event-details">
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="text-primary">{event.title}</CardTitle>
        <Button variant="ghost" size={"icon"} onClick={handleDelete}>
          <Trash2 className="h-6 w-6" />
        </Button>
      </CardHeader>
      <CardContent className="flex-col gap-3 justify-center items-center">
        <div>
          Date: <span className="base-semibold">{format(new Date(event.date), "dd/MM/yyyy HH:mm")}</span>
        </div>
        <div>
          Duration: <span className="base-semibold">{event.duration}</span>
        </div>
        {event.location && (
          <div>
            Location: <span className="base-semibold">{event.location}</span>
          </div>
        )}
        {event.isRecurring && event.recurrencePattern && (
          <div>
            Frequency: <span className="base-semibold">{event.recurrencePattern.frequency}</span><br />
            {event.recurrencePattern.endType === 'after' && event.recurrencePattern.occurrences !== undefined && (
              <span>Repeats: {event.recurrencePattern.occurrences} times</span>
            )}
            {event.recurrencePattern.endType === 'until' && event.recurrencePattern.endDate && (
              <div>
                 End Date: <span className="base-semibold">{format(new Date(event.recurrencePattern.endDate), "dd/MM/yyyy HH:mm")}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
