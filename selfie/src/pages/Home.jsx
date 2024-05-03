import { useState, useEffect } from 'react';

// components
import WorkoutDetails from '../components/WorkoutDetails'
import WorkoutForm from '../components/WorkoutForm';

function Home() {
    const [workouts, setworkouts] = useState(null)

    useEffect(() => {
        const fetchWorkouts = async () => {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/workouts`)
            const json = await response.json()

            if (response.ok) {
                setworkouts(json);
            }
        }
        fetchWorkouts()
    }, [workouts])

    return (
        <div className="home">
            <div className="workouts">
                {/* Usiamo le parentesi tonde per ritornare un template */}
                {workouts && workouts.map((workout) => (
                    <WorkoutDetails key={workout._id} workout={workout} />
                ))}
            </div>
            <WorkoutForm />
        </div>
    )
}

export default Home;