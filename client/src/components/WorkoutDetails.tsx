import { WorkoutSchema, client_log } from "@/lib/utils";
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
import { useWorkouts } from "@/context/WorkoutContext";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { isAxiosError } from "axios";

interface WorkoutDetailsProps {
  workout: WorkoutType;
}

export default function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const { dispatch } = useWorkouts();
  const { user } = useAuth();
  const api = useAxiosPrivate();

  async function handleDelete() {
    if (!user) {
      return;
    }

    try {
      const response = await api.delete(`/api/workouts/${workout._id}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });

      // La risposta dovrebbe contenere l'oggetto cancellato
      const json = response.data;
      // Controlliamo che lo schema sia corretto con zod
      const parsed = WorkoutSchema.safeParse(json);

      if (parsed.success) {
        dispatch({ type: "DELETE_WORKOUT", payload: [json] });
        client_log("Item successfully deleted");
      } else {
        client_log("Error while validating deleted item schema");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        client_log(
          `Error during deletion of item ${workout._id}: ` + error.message
        );
      }
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
