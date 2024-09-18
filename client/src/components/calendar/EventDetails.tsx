import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
// types
import { EventType } from "@/lib/utils";
// date fns
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import useEventsApi from "@/hooks/useEventsApi.tsx";
import { ICalendar, CalendarOptions } from "datebook";
import * as FileSaver from "file-saver";
import { useTimer } from "@/hooks/useTimer";

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
  const { deleteEvent, updateUserList } = useEventsApi();
  const { createTimer } = useTimer();
  const navigate = useNavigate();

  async function handleDelete() {
    if (user) {
      deleteEvent(event);
    }
  }
  async function handleUpdate() {
    if (user) {
      await updateUserList(event);
      setOpen(false);
    }
  }

  function handleGoToPomodoro() {
    if (
      event.currPomodoro?.study &&
      event.currPomodoro?.relax &&
      event.currPomodoro?.cycles
    ) {
      const eventTimer = createTimer(
        event.currPomodoro?.study,
        event.currPomodoro?.relax,
        event.currPomodoro?.cycles
      );

      // set localstorage before switching views
      localStorage.setItem("pomodoro_timer", JSON.stringify(eventTimer));

      navigate("/pomodoro");
    }
  }

  function handleExportToCalendar() {
    let upperCase = "";
    if (event.recurrencePattern?.frequency) {
      upperCase = event.recurrencePattern.frequency.toUpperCase();
    }

    const config: CalendarOptions = {
      title: event.title,
      location: event.location || "",
      start: new Date(event.date),
      end: addDurationToDate(new Date(event.date), event.duration),
      ...(event.isRecurring && {
        recurrence: {
          frequency: upperCase || "",
          count: event.recurrencePattern?.occurrences || 1,
          ...(event.recurrencePattern?.endDate && {
            end: new Date(event.recurrencePattern.endDate),
          }),
        },
      }),
    };

    function addDurationToDate(date: Date, duration: number): Date {
      const endDate = new Date(date);
      endDate.setHours(endDate.getHours() + duration);
      return endDate;
    }

    const icalendar = new ICalendar(config);
    const ics = icalendar.render();
    console.log(ics);

    const blob = new Blob([ics], {
      type: "text/calendar",
    });
    FileSaver.saveAs(blob, "my-calendar-event.ics");
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
            {event.itsPomodoro ? (
              <>
                <div>
                  Study Time:{" "}
                  <span className="base-semibold">
                    {event.expectedPomodoro?.study
                      ? event.expectedPomodoro.study
                      : "30"}{" "}
                    minutes
                  </span>
                </div>
                <div>
                  Relax Time:{" "}
                  <span className="base-semibold">
                    {event.expectedPomodoro?.relax
                      ? event.expectedPomodoro.relax
                      : "5"}{" "}
                    minutes
                  </span>
                </div>
                <div>
                  Cycles:{" "}
                  <span className="base-semibold">
                    {event.expectedPomodoro?.cycles ?? 5}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  Duration:{" "}
                  <span className="base-semibold">{event.duration} hours</span>
                </div>

                {event.location && (
                  <div>
                    Location:{" "}
                    <span className="base-semibold">{event.location}</span>
                  </div>
                )}
                {event.isRecurring && event.recurrencePattern && (
                  <div>
                    <div>
                      Frequency:{" "}
                      <span className="base-semibold">
                        {event.recurrencePattern.frequency}
                      </span>
                    </div>
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
                {event.author != user?.username &&
                  event.groupList.find(
                    (userItem) => userItem === user?.username
                  ) && (
                    <div>
                      <Button className="mt-2 " onClick={handleUpdate}>
                        Refuse event
                      </Button>
                    </div>
                  )}
              </>
            )}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size={"icon"} onClick={handleDelete}>
              <Trash2 className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>
        <Button
          variant="secondary"
          className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-none"
          onClick={handleExportToCalendar}
        >
          Export
        </Button>
        {event.itsPomodoro && (
          <Button
            variant="secondary"
            className="bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-none"
            onClick={handleGoToPomodoro}
          >
            Open Pomodoro
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
