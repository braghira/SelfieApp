import useWorkoutContext from "@/hooks/useWorkoutContext";
import { WorkoutSchema } from "@/lib/utils";
// components
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
// types
import { WorkoutType } from "@/lib/utils";
// date fns
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import useAuthContext from "@/hooks/useAuthContext";

interface WorkoutDetailsProps {
  workout: WorkoutType;
}

export default function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const { dispatch } = useWorkoutContext();
  const { user } = useAuthContext();

  async function handleDelete() {
    if (!user) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/workouts/` + workout._id,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token}` },
        }
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
    <Card className="workout-details">
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="text-primary">{workout.title}</CardTitle>
        <Button variant="ghost" size={"icon"} onClick={handleDelete}>
          <Trash2 className="h-6 w-6" />
        </Button>
      </CardHeader>
      <CardContent className="bg-primary-500 flex-col gap-3 justify-center items-center">
        <div>
          Load: <span className="base-semibold">{workout.load}</span>
        </div>
        <div>
          Reps: <span className="base-semibold">{workout.reps}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start">
        <div>
          {workout.createdAt &&
            formatDistanceToNow(new Date(workout.createdAt), {
              addSuffix: true,
            })}
        </div>
      </CardFooter>
    </Card>
  );
}
