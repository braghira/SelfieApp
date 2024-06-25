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
import { useAuth } from "@/context/AuthContext";
import useWorkoutsApi from "@/hooks/useWorkoutsApi.tsx";

interface WorkoutDetailsProps {
  workout: WorkoutType;
}

export default function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const { user } = useAuth();
  const { deleteWorkout } = useWorkoutsApi();

  async function handleDelete() {
    if (user) {
      deleteWorkout(workout);
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
      <CardContent className="flex-col gap-3 justify-center items-center">
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
