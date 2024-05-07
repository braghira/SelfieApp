import { useState, useEffect } from "react";

// components
import WorkoutDetails from "@/components/WorkoutDetails";
import WorkoutForm from "@/components/WorkoutForms";
import Navbar from "@/components/Navbar";
// types
import { Workout } from "@/lib/utils";

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/workouts`
      );
      const json = await response.json();

      if (response.ok) {
        setWorkouts(json);
      }
    };
    fetchWorkouts();
  }, []);

  function addWorkout(newWorkout: Workout) {
    // Logica per aggiungere un nuovo workout
    const updatedWorkouts = [newWorkout, ...(workouts || [])];
    setWorkouts(updatedWorkouts);
  }

  function deleteWorkout(delWorkout: Workout) {
    const updatedWorkouts = workouts?.filter(
      (workout) => workout._id !== delWorkout._id
    );
    if (updatedWorkouts) setWorkouts(updatedWorkouts);
    else setWorkouts(null);
  }

  return (
    <div className="home">
      <Navbar />
      <div className="workouts">
        {/* Usiamo le parentesi tonde per ritornare un template */}
        {workouts &&
          workouts.map((workout) => (
            <WorkoutDetails
              key={workout._id}
              workout={workout}
              deleteWorkout={deleteWorkout}
            />
          ))}
      </div>
      <WorkoutForm addWorkout={addWorkout} />
    </div>
  );
}
