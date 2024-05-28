import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// types
import { WorkoutSchema, WorkoutType } from "@/lib/utils";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Loader from "./Loader";
import useWorkoutContext from "@/hooks/useWorkoutContext";
import useAuthContext from "@/hooks/useAuthContext";

export default function WorkoutForm() {
  const { dispatch } = useWorkoutContext();
  const { user } = useAuthContext();

  const form = useForm<WorkoutType>({
    resolver: zodResolver(WorkoutSchema),
    defaultValues: {
      title: "",
      load: 0,
      reps: 0,
    },
  });

  async function onSubmit(workout: WorkoutType) {
    if (!user) {
      form.setError("root.serverError", {
        type: "You must be logged in",
      });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/workouts`,
        {
          method: "POST",
          body: JSON.stringify(workout),
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      // ritorna il singolo oggetto appena creato
      const data = await response.json();

      WorkoutSchema.safeParse(data);

      if (!response.ok) {
        console.log("Server did not respond");
      } else {
        dispatch({ type: "CREATE_WORKOUT", payload: [data] });
        console.log("new workout added", data);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
    // reset the form
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 mt-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Title</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Title of the workout"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="load"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Load</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="shad-input"
                  placeholder="Input a number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.valueAsNumber); // Utilizza valueAsNumber
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reps"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Reps</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="shad-input"
                  placeholder="Input a number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.valueAsNumber); // Utilizza valueAsNumber
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <FormMessage>
            {form.formState.errors.root.serverError.type}
          </FormMessage>
        )}
        <Button
          type="submit"
          className="shad-button_primary flex flex-col gap-5 mt-4"
        >
          {form.formState.isSubmitting ? <Loader /> : "Add Workout"}
        </Button>
      </form>
    </Form>
  );
}