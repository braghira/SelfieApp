import useWorkoutContext from "@/hooks/useWorkoutContext";
import { WorkoutSchema } from "@/lib/utils";
// components
import { Trash2 } from "lucide-react";
// types
import { WorkoutType } from "@/lib/utils";

interface WorkoutDetailsProps {
  workout: WorkoutType;
}

export default function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const { dispatch } = useWorkoutContext();

  async function handleDelete() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/workouts/` + workout._id,
        { method: "DELETE" }
      );

      // ritorna sempre l'oggetto cancellato
      const json = await response.json();
      // controlliamo che lo schema sia corretto con zod
      WorkoutSchema.safeParse(json);

      if (response.ok) {
        dispatch({ type: "DELETE_WORKOUT", payload: [json] });
        console.log("item successfully deleted");
      } else {
        console.log("error while deleting item");
      }
    } catch (error) {
      console.log(`error during deletion of item ${workout._id}: ` + error);
    }
  }

  return (
    <div className="workout-details flex justify-start size-full">
      <div className="block max-w-[18rem] rounded-lg border border-blue-800 bg-primary-500 shadow-slate-950">
        <div className="flex justify-between gap-3 border-b-2 border-neutral-100 px-6 py-3 text-surface dark:border-white/10 dark:text-white">
          {workout.title}
          <Trash2 className="hover:cursor-pointer" onClick={handleDelete} />
        </div>
        <div className="p-6">
          <h5 className="mb-2 text-xl font-medium leading-tight text-primary">
            {workout.load}
          </h5>
          <p className="mb-2 text-xl font-medium leading-tight text-primary">
            {workout.reps}
          </p>
          <p className="flex justify-center">{workout.createdAt}</p>
        </div>
      </div>
    </div>
  );
}
