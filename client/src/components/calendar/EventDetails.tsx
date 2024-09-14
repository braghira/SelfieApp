import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
// types
import { EventType } from "@/lib/utils";
// date fns
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import useEventsApi from "@/hooks/useEventsApi.tsx";

interface EventDetailsProps {
  event: EventType;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function EventDetails({
  event,
  open,
  setOpen,
}: EventDetailsProps) {
  const { user } = useAuth();
  const { deleteEvent } = useEventsApi();

  async function handleDelete() {
    if (user) {
      deleteEvent(event);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex-row">
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between items-start">
          <div>
            <div>
              Date:{" "}
              <span className="base-semibold">
                {format(new Date(event.date), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
            <div>
              Duration: <span className="base-semibold">{event.duration}</span>
            </div>
            {event.location && (
              <div>
                Location:{" "}
                <span className="base-semibold">{event.location}</span>
              </div>
            )}
            {event.isRecurring && event.recurrencePattern && (
              <div>
                Frequency:{" "}
                <span className="base-semibold">
                  {event.recurrencePattern.frequency}
                </span>
                <br />
                {event.recurrencePattern.endType === "after" &&
                  event.recurrencePattern.occurrences !== undefined && (
                    <span>
                      Repeats: {event.recurrencePattern.occurrences} times
                    </span>
                  )}
                {event.recurrencePattern.endType === "until" &&
                  event.recurrencePattern.endDate && (
                    <div>
                      End Date:{" "}
                      <span className="base-semibold">
                        {format(
                          new Date(event.recurrencePattern.endDate),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size={"icon"} onClick={handleDelete}>
              <Trash2 className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
