import { useContext, useEffect } from "react";
// components
import WorkoutDetails from "@/components/WorkoutDetails";
import WorkoutForm from "@/components/WorkoutForm";
import { WorkoutSchema } from "@/lib/utils";
import api from "@/lib/axios";
import { WorkoutContext } from "@/context/WorkoutContext";
import { AuthContext } from "@/context/AuthContext";

export default function Dashboard() {
  const { workouts, dispatch } = useContext(WorkoutContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // GET
    const fetchWorkouts = async () => {
      try {
        const response = await api.get("/api/workouts", {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        });

        if (response.status === 200) {
          const json = response.data;
          // parsing come array
          const parsed = WorkoutSchema.array().safeParse(json);

          if (parsed.success) {
            dispatch({ type: "SET_WORKOUTS", payload: json });
          } else {
            console.error("Error parsing workouts:", parsed.error);
          }
        } else {
          console.error("Failed to fetch workouts:", response.statusText);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching workouts:",
          error.message
        );
      }
    };
    if (user) {
      fetchWorkouts();
    }
  }, [dispatch, user]);

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
