import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserType, UserSchema } from "@/lib/utils";
import Loader from "@/components/Loader";
import { parseISO } from "date-fns";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import useUpdateProfile from "@/hooks/useUpdateProfile";

export default function Profile() {
  const { user } = useAuth();
  const { updateProfile } = useUpdateProfile();

  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      username: "",
      name: "",
      surname: "",
      birthday: new Date(),
    },
  });

  useEffect(() => {
    form.reset(user); // Precompila i campi con i dati utente
  }, [form]);

  async function onSubmit(values: UserType) {
    console.log("Profile: ", values);
    await updateProfile(values, (err) => {
      form.setError("root.serverError", { message: err });
    });
  }

  return (
    <>
      <h3 className="text-lg font-medium">Profile</h3>
      <p className="text-sm text-muted-foreground">
        This is how others will see you on the site.
      </p>

      <Separator className="my-4" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    aria-label="Name"
                    className="sm:w-2/6 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    aria-label="Name"
                    className="sm:w-1/4 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surname</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    aria-label="Surname"
                    className="sm:w-1/4 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthday"
            render={() => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Controller
                    name="birthday"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        value={field.value?.toISOString().split("T")[0] || ""}
                        onChange={(e) =>
                          field.onChange(parseISO(e.target.value))
                        }
                        aria-label="Date of Birth"
                        className="text-sm md:text-base w-48"
                      />
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Server errors */}
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive space-y-2">
              {form.formState.errors.root.serverError.message}
            </div>
          )}

          <Button
            type="submit"
            className="mt-4 sm:w-fit"
            aria-label="Save Changes"
          >
            {form.formState.isSubmitting ? <Loader /> : "Save Changes"}
          </Button>
        </form>
      </Form>
    </>
  );
}
