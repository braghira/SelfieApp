import { useEffect } from "react";
// components
import WorkoutDetails from "@/components/WorkoutDetails";
import WorkoutForm from "@/components/WorkoutForm";
// context
import { useWorkouts } from "@/context/WorkoutContext";
import { useAuth } from "@/context/AuthContext";
// hooks
import useWorkoutsApi from "@/hooks/useWorkoutsApi.tsx";

export default function Dashboard() {
  const { workouts, dispatch } = useWorkouts();
  const { user } = useAuth();
  const { getWorkouts } = useWorkoutsApi();

  useEffect(() => {
    if (user) {
      getWorkouts();
    }
  }, [dispatch, user]); // only re render when an action is performed on a workout

  return (
    <div className="container mb-8">
      <div className="grid sm:grid-cols-[3fr_1fr] gap-7">
        <div className="flex max-w-3xl justify-between flex-col gap-5">
          {workouts &&
            workouts.map((workout) => (
              <WorkoutDetails key={workout._id} workout={workout} />
            ))}
        </div>
        <WorkoutForm />
      </div>
    </div>
  );
}
