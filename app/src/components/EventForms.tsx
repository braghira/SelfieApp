import { useState, FormEvent } from "react";
import { Event } from "@/lib/utils";

interface FormProps {
  addEvent: (event: Event) => void;
}

export default function EventForm({ addEvent }: FormProps) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [duration, setDuration] = useState(1); // Durata in ore
    const [location, setLocation] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [recurrenceEndType, setRecurrenceEndType] = useState<'never' | 'after' | 'until'>('never');
    const [recurrenceOccurrences, setRecurrenceOccurrences] = useState(1);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const event: Event = { 
            title,
            date,
            duration,
            location,
            isRecurring,
            recurrencePattern: isRecurring ? {
                frequency: recurrenceFrequency,
                endType: recurrenceEndType,
                occurrences: recurrenceEndType === 'after' ? recurrenceOccurrences : undefined,
                endDate: recurrenceEndType === 'until' ? recurrenceEndDate : undefined
            } : undefined 
        };

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BASE_URL}/api/events`,
                {
                    method: "POST",
                    body: JSON.stringify(event),
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const json = await response.json();

            if (!response.ok) {
                setError(json.error);
            } else {
                addEvent(json);
                // reset the form
                setTitle("");
                setDate("");
                setDuration(1);
                setLocation("");
                setIsRecurring(false);
                setRecurrenceFrequency('daily');
                setRecurrenceEndType('never');
                setRecurrenceOccurrences(1);
                setRecurrenceEndDate("");
                setError(null);
            }
        } catch (error) {
            console.error("An error occurred:", error);
            setError("An error occurred while adding the event.");
        }
    }

    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Add a new event</h3>

            <label>Event Name:</label>
            <input
                type="text"
                onChange={(e) => setTitle(e.target.value.trim())}
                style={{ backgroundColor: 'gray' }} 
                value={title}
            />

            <label>Date:</label>
            <input
                type="datetime-local"
                onChange={(e) => {
                    const formattedValue = e.target.value.substring(0, 16);
                    setDate(formattedValue)
                }}
                style={{ backgroundColor: 'gray' }}
                value={date}
            />

            <label>Duration:</label>
            <input
                type="number"
                onChange={(e) => setDuration(e.target.valueAsNumber)}
                style={{ backgroundColor: 'gray' }}
                value={duration}
            />

            <label>Location:</label>
            <input
                type="text"
                onChange={(e) => setLocation(e.target.value.trim())}
                style={{ backgroundColor: 'gray' }} 
                value={location}
            />

            <label>Is Recurring:</label>
            <input
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
            />

            {isRecurring && (
                <>
                    <label>Frequency:</label>
                    <select
                        value={recurrenceFrequency}
                        style={{ backgroundColor: 'gray' }}
                        onChange={(e) => setRecurrenceFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>

                    <label>End Type:</label>
                    <select
                        value={recurrenceEndType}
                        style={{ backgroundColor: 'gray' }}
                        onChange={(e) => setRecurrenceEndType(e.target.value as 'never' | 'after' | 'until')}
                    >
                        <option value="never">Never</option>
                        <option value="after">After N occurrences</option>
                        <option value="until">Until a specific date</option>
                    </select>

                    {recurrenceEndType === 'after' && (
                        <>
                            <label>Occurrences:</label>
                            <input
                                type="number"
                                onChange={(e) => setRecurrenceOccurrences(e.target.valueAsNumber)}
                                style={{ backgroundColor: 'gray' }}
                                value={recurrenceOccurrences}
                            />
                        </>
                    )}

                    {recurrenceEndType === 'until' && (
                        <>
                            <label>End Date:</label>
                            <input
                                type="datetime-local"
                                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                style={{ backgroundColor: 'gray' }}
                                value={recurrenceEndDate}
                            />
                        </>
                    )}
                </>
            )}

            <button>Add event</button>
            {error && <div className="error">{error}</div>}
        </form>
    );
}
