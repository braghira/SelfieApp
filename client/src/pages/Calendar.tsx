import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import EventForm from "@/components/calendar/EventForms";
import EventDetails from "@/components/calendar/EventDetails";
import ActivityForm from "@/components/calendar/ActivityForms";
import ActivityList from "@/components/calendar/ActivityList";
import { useEvents } from "@/context/EventContext";
import { useActivities } from "@/context/ActivityContext";
import { useAuth } from "@/context/AuthContext";
import usePushNotification, {
  NotificationPayload,
} from "@/hooks/usePushNotification";
import { EventType } from "@/lib/utils";
import { useTimeMachineContext } from "@/context/TimeMachine";

interface CustomEvent {
  start: Date;
  end: Date;
  title: string;
  type: "event" | "activity" | "pomodoro" | "group";
  _id: string;
}

type NotificationEventStatus = {
  [eventId: string]: { "24h"?: boolean; "3h"?: boolean; "1h"?: boolean };
};

type NotificationActivityStatus = {
  [activityId: string]: { lastNotified?: string };
};

type ViewType = "eventForm" | "activityForm" | "activityList";

export default function CalendarPage() {
  const localizer = momentLocalizer(moment);
  const { activities } = useActivities();
  const { events } = useEvents();
  const { user } = useAuth();
  const { RequestPushSub, sendNotification } = usePushNotification();
  const [activeView, setActiveView] = useState<ViewType | null>(null);

  const handleToggle = (view: ViewType) => {
    setActiveView((prev) => (prev === view ? null : view));
  };

  const [notificationEventStatus, setNotificationEventStatus] =
    useState<NotificationEventStatus>(() => {
      const savedStatus = localStorage.getItem("notificationEventStatus");

      // console.log("Loaded event status from localStorage", savedStatus);

      return savedStatus ? JSON.parse(savedStatus) : {};
    });

  const [notificationActivitiesStatus, setNotificationActivitiesStatus] =
    useState<NotificationActivityStatus>(() => {
      const savedStatus = localStorage.getItem("notificationActivityStatus");

      // console.log("Loaded activity status from localStorage", savedStatus);

      return savedStatus ? JSON.parse(savedStatus) : {};
    });

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const { currentDate } = useTimeMachineContext();

  //  console.log(isEventDetailsOpen);

  useEffect(() => {
    if (notificationEventStatus) {
      localStorage.setItem(
        "notificationEventStatus",
        JSON.stringify(notificationEventStatus)
      );
    }
  }, [notificationEventStatus]);

  useEffect(() => {
    if (notificationActivitiesStatus) {
      localStorage.setItem(
        "notificationActivitiesStatus",
        JSON.stringify(notificationActivitiesStatus)
      );
    }
  }, [notificationActivitiesStatus]);

  const colors = {
    late: "#ff7514",
    onTime: "#4087b3",
    event: "#3fb33f",
    pomodoro: "#d15446",
    notConfirmed: "#89AC76",
  };

  const sendEventNotification = (
    userID: string,
    timeLeft: string,
    eventTitle: string
  ) => {
    const payload: NotificationPayload = {
      title: "Upcoming Event!!!",
      body: `Check out your calendar, ${timeLeft} hours left until the event: ${eventTitle}`,
      url: `/calendar`,
    };
    RequestPushSub(() => sendNotification(userID, payload));
  };

  const sendActivityNotification = (
    userID: string,
    daysPassed: number,
    activityName: string,
    activityId: string,
    activityStatus: { [activityId: string]: { lastNotified?: string } }
  ) => {
    const today = moment(currentDate).format("YYYY-MM-DD");
    let title = "You are late to complete an activity!";
    if (!activityStatus[activityId]) {
      activityStatus[activityId] = {};
    }
    if (daysPassed >= 2 && daysPassed < 5) {
      title = "This activity isn't complete yet, FINISH IT!";
    } else if (daysPassed >= 5) {
      title = "YOU HAVE TO FINISH THIS ACTIVITY NOW!!!";
    }
    if (activityStatus[activityId].lastNotified != today) {
      const payload: NotificationPayload = {
        title: title,
        body: `L'attività: ${activityName} è scaduta da ${++daysPassed} giorni. Ricordati di completarla!`,
        url: `/calendar`,
      };
      RequestPushSub(() => sendNotification(userID, payload));
      activityStatus[activityId].lastNotified = today;
      setNotificationActivitiesStatus({ ...activityStatus });
    }
  };

  const eventPropGetter = (event: CustomEvent) => {
    const now = moment(currentDate);
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
    } else if (event.type === "pomodoro") {
      backgroundColor = colors.pomodoro;
    } else if (event.type === "group") {
      backgroundColor = colors.notConfirmed;
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

    if (
      selectedEvent.type === "event" ||
      selectedEvent.type === "pomodoro" ||
      selectedEvent.type === "group"
    ) {
      const fullEvent = events?.find((e) => e._id === selectedEvent._id);
      if (fullEvent) {
        setSelectedEvent(fullEvent);
        setIsEventDetailsOpen(true);
      }
    }
  };

  const elementList: CustomEvent[] = [
    ...(events?.flatMap((event) => {
      const momentDate = moment(new Date(event.date));
      const dates: CustomEvent[] = [];
      let eventType: "event" | "group";
      if (event.author !== user?.username && !event.itsPomodoro) {
        eventType = "group";
      } else {
        eventType = "event";
      }

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
            end: newDate
              .add(event.hours * 60 + event.minutes, "minute")
              .toDate(),
            title: event.title,
            type: eventType,
            _id: event._id ? event._id : "no_ID",
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
              end: newDate
                .clone()
                .add(event.hours * 60 + event.minutes, "minute")
                .toDate(),
              title: event.title,
              type: eventType,
              _id: event._id ? event._id : "no_ID",
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
              end: endDate
                .clone()
                .add(event.hours * 60 + event.minutes, "minute")
                .toDate(),
              title: event.title,
              type: eventType,
              _id: event._id ? event._id : "no_ID",
            });
          }
        }
      } else if (event.itsPomodoro) {
        dates.push({
          start: momentDate.toDate(),
          end: momentDate
            .add(event.hours * 60 + event.minutes, "minute")
            .toDate(),
          title: event.title,
          type: "pomodoro",
          _id: event._id ? event._id : "no_ID",
        });
      } else {
        dates.push({
          start: momentDate.toDate(),
          end: momentDate
            .add(event.hours * 60 + event.minutes, "minute")
            .toDate(),
          title: event.title,
          type: eventType,
          _id: event._id ? event._id : "no_ID",
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
              _id: activity._id,
            } as CustomEvent)
          : null;
      })
      .filter((activity) => activity !== null) || []),
  ];

  useEffect(() => {
    const userID = user?._id;
    const now = moment(currentDate);
    if (userID && events) {
      const updatedEventStatus = { ...notificationEventStatus };
      events.forEach((event) => {
        const eventId = event._id;
        if (eventId) {
          const eventStart = moment(event.date);
          const timeLeft = eventStart.diff(now, "hours");
          if (!updatedEventStatus[eventId]) {
            updatedEventStatus[eventId] = {};
          }
          if (timeLeft === 24 && !updatedEventStatus[eventId]["24h"]) {
            const eventTitle = event.title;
            sendEventNotification(userID, "24h", eventTitle);
            updatedEventStatus[eventId]["24h"] = true;
          }
          if (timeLeft === 3 && !updatedEventStatus[eventId]["3h"]) {
            const eventTitle = event.title;
            sendEventNotification(userID, "3h", eventTitle);
            updatedEventStatus[eventId]["3h"] = true;
          }
          if (timeLeft === 1 && !updatedEventStatus[eventId]["1h"]) {
            const eventTitle = event.title;
            sendEventNotification(userID, "1h", eventTitle);
            updatedEventStatus[eventId]["1h"] = true;
          }
        }
      });
      setNotificationEventStatus(updatedEventStatus);
    }

    if (userID && activities) {
      const updatedActivityStatus = { ...notificationActivitiesStatus };
      activities.forEach((activity) => {
        const activityId = activity._id;
        if (activityId && activity.endDate && !activity.completed) {
          const endDate = moment(activity.endDate);
          const daysOverdue = now.diff(endDate, "days");
          if (endDate.isBefore(now, "day")) {
            const activityName = activity.title;
            sendActivityNotification(
              userID,
              daysOverdue,
              activityName,
              activityId,
              updatedActivityStatus
            );
          }
        }
      });
    }
  }, [currentDate]);

  return (
    <div className="view-container">
      <div id="event-details-container">
        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            open={isEventDetailsOpen}
            setOpen={setIsEventDetailsOpen}
          />
        )}
      </div>
      <div className="flex flex-col gap-8 sm:grid lg:grid-cols-[3fr_1fr] sm:grid-cols-1">
        <Calendar
          localizer={localizer}
          views={["month", "week", "day"]}
          events={elementList}
          min={moment("2024-10-10T00:00:00").toDate()}
          max={moment("2024-10-10T23:59:59").toDate()}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelected}
          getNow={() => moment(currentDate).toDate()}
        />
        <div className="hidden lg:block">{activities && <ActivityList />}</div>
      </div>
      <div className="hidden md:flex flex-col items-center gap-4 mt-8 md:flex-row md:justify-around">
        <EventForm />
        <ActivityForm />
      </div>
      <div className="md:hidden flex gap-4 items-center justify-around mt-4">
        <button
          className="bg-primary rounded-md text-primary-foreground border-primary hover:bg-primary/90 shadow-none p-1"
          onClick={() => handleToggle("eventForm")}
        >
          Add Event
        </button>
        <button
          className="bg-primary rounded-md text-primary-foreground border-primary hover:bg-primary/90 shadow-none p-1"
          onClick={() => handleToggle("activityForm")}
        >
          Add Activity
        </button>
        <button
          className="bg-primary rounded-md text-primary-foreground border-primary hover:bg-primary/90 shadow-none p-1"
          onClick={() => handleToggle("activityList")}
        >
          Activities List
        </button>
      </div>
      <div className="lg:hidden">
        {activeView === "eventForm" && <EventForm />}
        {activeView === "activityForm" && <ActivityForm />}
        {activeView === "activityList" && activities && <ActivityList />}
      </div>
    </div>
  );
}
