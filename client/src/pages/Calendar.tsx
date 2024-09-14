import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
// components
import EventForm from "@/components/calendar/EventForms";
import EventDetails from "@/components/calendar/EventDetails";
import ActivityForm from "@/components/calendar/ActivityForms";
import ActivityList from "@/components/calendar/ActivityList";
// context
import { useEvents } from "@/context/EventContext";
import { useActivities } from "@/context/ActivityContext";
import { useAuth } from "@/context/AuthContext";
// hooks
import useActivitiesApi from "@/hooks/useActivitiesApi";
import useEventsApi from "@/hooks/useEventsApi.tsx";
import usePushNotification, { NotificationPayload } from "@/hooks/usePushNotification";

import { EventType } from "@/lib/utils";

export default function CalendarPage() {
  const localizer = momentLocalizer(moment);
  const { activities, dispatch: dispatchA } = useActivities();
  const { events, dispatch: dispatchE } = useEvents();
  const { user } = useAuth();
  const { getEvents } = useEventsApi();
  const { getActivities } = useActivitiesApi();
  const { RequestPushSub, sendNotification } = usePushNotification();
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>({});

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getActivities();
      getEvents();
    }
  }, [dispatchA, dispatchE, user]);

  const colors = {
    late: "#d15446",
    onTime: "#4087b3",
    event: "#3fb33f",
  };

  interface CustomEvent {
    start: Date;
    end: Date;
    title: string;
    type: "event" | "activity";
  }

  type NotificationStatus = {
    [eventId: string]: { "24h"?: boolean; "3h"?: boolean; "1h"?: boolean; daily?: boolean; };
  };

  //se mancano 24, 3 o 1 ore invio una notifica
    useEffect(() => {
      const userID = user?._id;
      const now = moment(); 
      if (userID && events) {
        const updatedStatus = { ...notificationStatus };
        events.forEach((event) => { 
          const eventId = event._id; 
          if (eventId) {
          const eventStart = moment(event.date);
          const timeLeft = eventStart.diff(now, "hours");
          if (!updatedStatus[eventId]) {
            updatedStatus[eventId] = {};
          }
          if (timeLeft === 24 && !updatedStatus[eventId]["24h"]) {
            sendEventNotification(userID,"24h", eventId);
          }
          if (timeLeft === 3 && !updatedStatus[eventId]["3h"]) {
            sendEventNotification(userID,"3h",eventId);
          }
          if (timeLeft === 1 && !updatedStatus[eventId]["1h"]) {
            sendEventNotification(userID,"1h",eventId);
          }
        }
        });
        //per le attività mando un ricordo giornalmente
        activities.forEach((activity) => {
          const activityId = activity._id;
          if (activityId && activity.endDate && !activity.completed) {
            const endDate = moment(activity.endDate);
            const daysOverdue = now.diff(endDate, 'days');
            if (endDate.isBefore(now, 'day')) {
              if (!updatedStatus[activityId]) {
                updatedStatus[activityId] = {};
              }
              if (!updatedStatus[activityId].daily) {
                sendActivityNotification(userID, daysOverdue, activityId);
                updatedStatus[activityId].daily = true; 
              }
            }
          }
        });
          setNotificationStatus(updatedStatus);
      }
    }, [events, activities, user, notificationStatus]);

    const sendEventNotification = (userID: string, timeLeft: string, eventId: string) => {
      const payload: NotificationPayload = {
        title: "Upcoming Event!!!",
        body: `Check out your calendar, ${timeLeft} hours left until the event`,
        url: `http://localhost:5173/calendar`,
      };
      RequestPushSub(() => sendNotification(userID, payload));
      setNotificationStatus(prevStatus => ({
        ...prevStatus,
        [eventId]: { ...prevStatus[eventId], [timeLeft]: true },
      }));
    }
    
    const sendActivityNotification = (userID: string, daysPassed: number, activityId: string) => {
      const payload: NotificationPayload = {
        title: "Attività Scaduta!",
        body: `L'attività è scaduta da ${daysPassed} giorni. Ricordati di completarla!`,
        url: `http://localhost:5173/calendar`,
      };
      RequestPushSub(() => sendNotification(userID, payload));     
      setNotificationStatus((prevStatus) => ({
        ...prevStatus,
        [activityId]: { ...prevStatus[activityId], [`day${daysPassed}`]: true },
      }));
    };
    

  const eventPropGetter = (event: CustomEvent) => {
    const now = moment();
    const start = moment(event.start);
    let backgroundColor;

    if (event.type === "event") {
      backgroundColor = colors.event;
    } else if (event.type === "activity") {
      if (start.isBefore(now)) {
        backgroundColor = colors.late;
      } else {
        backgroundColor = colors.onTime;
      }
    }
    return {
      style: {
        backgroundColor,
      },
      className: "custom-event",
    };
  };

  const handleSelected = (event: Event) => {
    const selectedEvent = event as CustomEvent;

    if (selectedEvent.type === "event") {
      const fullEvent = events?.find((e) => e.title === selectedEvent.title);
      if (fullEvent) {
        setSelectedEvent(fullEvent);
        setOpen(true);
      }
    }
  };

  const elementList: CustomEvent[] = [
    ...(events?.flatMap((event) => {
      const momentDate = moment(new Date(event.date));
      const dates: CustomEvent[] = [];

      if (event.isRecurring && event.recurrencePattern?.endType === "after") {
        for (let i = 0; i < (event.recurrencePattern.occurrences ?? 0); i++) {
          let newDate = momentDate.clone();
          if (event.recurrencePattern?.frequency === "daily") {
            newDate = newDate.add(i, "days");
          } else if (event.recurrencePattern?.frequency === "weekly") {
            newDate = newDate.add(i, "weeks");
          } else if (event.recurrencePattern?.frequency === "monthly") {
            newDate = newDate.add(i, "months");
          }
          dates.push({
            start: newDate.toDate(),
            end: newDate.add(event.duration, "hour").toDate(),
            title: event.title,
            type: "event",
          });
        }
      } else if (
        event.isRecurring &&
        event.recurrencePattern?.endType === "until"
      ) {
        let newDate = momentDate.clone();
        const endDate = event.recurrencePattern?.endDate
          ? moment(new Date(event.recurrencePattern.endDate))
          : null;
        if (endDate) {
          while (newDate.isBefore(endDate)) {
            dates.push({
              start: newDate.toDate(),
              end: newDate.clone().add(event.duration, "hour").toDate(),
              title: event.title,
              type: "event",
            });
            if (event.recurrencePattern?.frequency === "daily") {
              newDate = newDate.add(1, "days");
            } else if (event.recurrencePattern?.frequency === "weekly") {
              newDate = newDate.add(1, "weeks");
            } else if (event.recurrencePattern?.frequency === "monthly") {
              newDate = newDate.add(1, "months");
            }
          }
          if (newDate.isSame(endDate, "day")) {
            dates.push({
              start: endDate.toDate(),
              end: endDate.clone().add(event.duration, "hour").toDate(),
              title: event.title,
              type: "event",
            });
          }
        }
      } else {
        dates.push({
          start: momentDate.toDate(),
          end: momentDate.add(event.duration, "hour").toDate(),
          title: event.title,
          type: "event",
        });
      }
      return dates;
    }) || []),
    ...(activities
      ?.map((activity) => {
        return activity.endDate && !activity.completed
          ? ({
              start: new Date(activity.endDate),
              end: new Date(activity.endDate),
              title: activity.title,
              allDay: true,
              type: "activity" as const,
            } as CustomEvent)
          : null;
      })
      .filter((activity) => activity !== null) || []),
  ];

  return (
    <div className="container mb-2 mt-6">
      <div id="event-details-container">
        {selectedEvent && (
          <EventDetails event={selectedEvent} open={open} setOpen={setOpen} />
        )}
      </div>
      <div className="flex flex-col gap-8 sm:grid lg:grid-cols-[3fr_1fr] sm:grid-cols-1">
        <Calendar
          localizer={localizer}
          views={["month", "week", "day"]}
          events={elementList}
          min={moment("2024-10-10T07:00:00").toDate()}
          max={moment("2024-10-10T22:00:00").toDate()}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelected}
        />
        <div className="hidden lg:block">
          {activities && <ActivityList activities={activities} />}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 mt-8 sm:flex-row sm:justify-around">
        <EventForm />
        <ActivityForm />
      </div>
    </div>
  );
}
