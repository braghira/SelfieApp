import { useState, useEffect } from 'react';

// components
import WorkoutDetails from '../components/WorkoutDetails'

function Home() {
    const [workouts, setworkouts] = useState(null)

    useEffect(() => {
        const fetchWorkouts = async () => {
            const response = await fetch('http://localhost:8000/api/workouts')
            const json = await response.json()

            if (response.ok) {
                setworkouts(json);
            }
        }

        fetchWorkouts()
    }, [])

    return (
        <div className="home">
            <div className="workouts">
                {/* Usiamo le parentesi tonde per ritornare un template */}
                {workouts && workouts.map((workout) => (
                    <WorkoutDetails key={workout._id} workout={workout} />
                ))}
            </div>
        </div>
    )
}

export default Home;