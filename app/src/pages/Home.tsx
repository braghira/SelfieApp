import { useEffect } from "react";
import useWorkoutContext from "@/hooks/useWorkoutContext";
// components
import WorkoutDetails from "@/components/WorkoutDetails";
import WorkoutForm from "@/components/WorkoutForms";
import Navbar from "@/components/Navbar";
import { WorkoutSchema } from "@/lib/utils";

export default function Home() {
  const { workouts, dispatch } = useWorkoutContext();

  useEffect(() => {
    // GET
    const fetchWorkouts = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/workouts`
      );
      // ritorna un array oppure un singolo oggetto
      const json = await response.json();
      // parsing come array
      WorkoutSchema.array().parse(json);

      if (response.ok) {
        dispatch({ type: "SET_WORKOUTS", payload: json });
      }
    };
    fetchWorkouts();
  }, [dispatch]);

  return (
    <div className="home">
      <Navbar />
      <div className="workouts">
        {/* Usiamo le parentesi tonde per ritornare un template */}
        {workouts &&
          workouts.map((workout) => (
            <WorkoutDetails key={workout._id} workout={workout} />
          ))}
      </div>
      <WorkoutForm />
    </div>
  );
}
