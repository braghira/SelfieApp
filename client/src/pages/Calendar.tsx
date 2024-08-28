import { useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from 'moment';
// components
import EventForm from "@/components/EventForms";
import ActivityForm from "@/components/ActivityForms";
import ActivityList from "@/components/ActivityList";
// context
import { useEvents } from "@/context/EventContext";
import { useActivities } from "@/context/ActivityContext";
import { useAuth } from "@/context/AuthContext";
// hooks
import useActivitiesApi from "@/hooks/useActivitiesApi";
import useEventsApi from "@/hooks/useEventsApi.tsx";

export default function CalendarPage() {
    const localizer = momentLocalizer(moment);
    const { activities, dispatch: dispatchA } = useActivities();
    const { events, dispatch: dispatchE } = useEvents();
    const { user } = useAuth();
    const { getEvents } = useEventsApi();
    const { getActivities } = useActivitiesApi();

    useEffect(() => {
        if (user) {
            getActivities();
            getEvents();
        }
    }, [dispatchA, dispatchE, user]);

    const elementList = [
        ...events?.flatMap(event => {
            const momentDate = moment(new Date(event.date));
            const endDateAmericanFormat = momentDate.format('YYYY-MM-DD hh:mm A');
            const dates = [];
            
            if (event.isRecurring && event.recurrencePattern?.endType === 'after') {
                for (let i = 0; i < (event.recurrencePattern.occurrences ?? 0); i++) {
                    let newDate = momentDate.clone();
                    if (event.recurrencePattern?.frequency === 'daily') {
                        newDate = newDate.add(i, 'days');
                    } else if (event.recurrencePattern?.frequency === 'weekly') {
                        newDate = newDate.add(i, 'weeks');
                    } else if (event.recurrencePattern?.frequency === 'monthly') {
                        newDate = newDate.add(i, 'months');
                    }
                    dates.push({
                        start: newDate.toDate(),
                        end: newDate.add(event.duration, 'hour').toDate(),
                        title: event.title,
                        data: { event },
                        formattedEndDate: endDateAmericanFormat,
                        className: 'rbc-event'
                    });
                }
            } else if (event.isRecurring && event.recurrencePattern?.endType === 'until') {
                let newDate = momentDate.clone();
                const endDate = event.recurrencePattern?.endDate ? moment(new Date(event.recurrencePattern.endDate)) : null;
                if (endDate) {
                    while (newDate.isBefore(endDate)) {
                        dates.push({
                            start: newDate.toDate(),
                            end: newDate.clone().add(event.duration, 'hour').toDate(),
                            title: event.title,
                            data: { event },
                            formattedEndDate: endDateAmericanFormat,
                            className: 'rbc-event'
                        });
                        if (event.recurrencePattern?.frequency === 'daily') {
                            newDate = newDate.add(1, 'days');
                        } else if (event.recurrencePattern?.frequency === 'weekly') {
                            newDate = newDate.add(1, 'weeks');
                        } else if (event.recurrencePattern?.frequency === 'monthly') {
                            newDate = newDate.add(1, 'months');
                        }
                    }
                    if (newDate.isSame(endDate, 'day')) {
                        dates.push({
                            start: endDate.toDate(),
                            end: endDate.clone().add(event.duration, 'hour').toDate(),
                            title: event.title,
                            data: { event },
                            formattedEndDate: endDateAmericanFormat,
                            className: 'rbc-event'
                        });
                    }
                }
            } else {
                dates.push({
                    start: momentDate.toDate(),
                    end: momentDate.add(event.duration, 'hour').toDate(),
                    title: event.title,
                    data: { event },
                    formattedEndDate: endDateAmericanFormat,
                    className: 'rbc-event'
                });
            }
            return dates;
        }) || [],
        ...activities?.map(activity => {
            return activity.endDate && !activity.completed ? {
                start: new Date(activity.endDate),
                end: new Date(activity.endDate),
                title: activity.title,
                allDay: true,
            } : null;
        }).filter(activity => activity !== null) || []
    ];

    return (
        <div className="container mb-2">
            <div className="grid sm:grid-cols-[3fr_1fr] gap-8">
                <Calendar
                    localizer={localizer}
                    views={["month", "week", "day"]}
                    events={elementList}
                    min={moment("2024-10-10T07:00:00").toDate()}
                    max={moment("2024-10-10T22:00:00").toDate()}
                />
                {activities && <ActivityList activities={activities} />}
            </div>
            <div className="flex justify-around mt-5">
                <EventForm />
                <ActivityForm />
            </div>
        </div>
    );
}
