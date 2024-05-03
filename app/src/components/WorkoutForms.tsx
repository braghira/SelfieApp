import React, { useState, FormEvent } from "react";
import { Workout } from "@/lib/utils";

type WorkoutProps = {
    addWorkout: (workout: Workout) => void;
}

const WorkoutForm: React.FC<WorkoutProps> = ({ addWorkout }) => {
    const [title, setTitle] = useState("");
    const [load, setLoad] = useState(0);
    const [reps, setReps] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const workout: Workout = { title, load, reps };

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/workouts`, {
                method: 'POST',
                body: JSON.stringify(workout),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const json = await response.json();

            if (!response.ok) {
                setError(json.error);
            } else {
                addWorkout(json);
                // reset the form
                setTitle("");
                setLoad(0);
                setReps(0);
                setError(null);
                console.log("new workout added", json);
            }
        } catch (error) {
            console.error("An error occurred:", error);
            setError("An error occurred while adding the workout.");
        }
    };

    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Add a new workout</h3>

            <label>Exercise Name:</label>
            <input
                type="text"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
            />

            <label>Load in kg:</label>
            <input
                type="number"
                onChange={(e) => setLoad(e.target.valueAsNumber)}
                value={load}
            />

            <label>Reps:</label>
            <input
                type="number"
                onChange={(e) => setReps(e.target.valueAsNumber)}
                value={reps}
            />

            <button>Add Workout</button>
            {error && <div className="error">{error}</div>}
        </form>
    );
};

export default WorkoutForm;
