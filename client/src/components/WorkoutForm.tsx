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
import api from "@/lib/axios";
import { WorkoutContext } from "@/context/WorkoutContext";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function WorkoutForm() {
  const { dispatch } = useContext(WorkoutContext);
  const { user } = useContext(AuthContext);

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
      const response = await api.post("/api/workouts", workout, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      // Controlliamo che lo schema sia corretto con zod
      const parsed = WorkoutSchema.safeParse(response.data);

      if (parsed.success) {
        dispatch({ type: "CREATE_WORKOUT", payload: [response.data] });
        console.log("new workout added", response.data);
      } else {
        console.log("Error while validating created workout schema");
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
