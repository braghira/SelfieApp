import { Workout } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface WorkoutDetailsProps {
  workout: Workout;
  deleteWorkout: (workout: Workout) => void;
}

export default function WorkoutDetails({
  workout,
  deleteWorkout,
}: WorkoutDetailsProps) {
  async function handleDelete() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/workouts/` + workout._id,
        { method: "DELETE" }
      );

      const json = await response.json();

      if (response.ok) {
        deleteWorkout(json);
        console.log("item successfully deleted");
      } else {
        console.log("error while deleting item");
      }
    } catch (error) {
      console.log(`error during deletion of item ${workout._id}: ` + error);
    }
  }

  return (
    <div className="workout-details flex justify-start">
      <div className="block max-w-[18rem] rounded-lg border border-blue-800 bg-surface-dark shadow-slate-950">
        <div className="border-b-2 border-neutral-100 px-6 py-3 text-surface dark:border-white/10 dark:text-white">
          {workout.title}
        </div>
        <div className="p-6">
          <h5 className="mb-2 text-xl font-medium leading-tight text-primary">
            {workout.load}
          </h5>
          <p className="mb-2 text-xl font-medium leading-tight text-primary">
            {workout.reps}
          </p>
          <p className="flex justify-stretch">
            {workout.createdAt}
            <Trash2
              className="hover:cursor-pointer mx-3"
              onClick={handleDelete}
            />
          </p>
        </div>
      </div>
    </div>
  );
}
