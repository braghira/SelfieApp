// hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import useSignup from "@/hooks/useSignup";
// components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { UserType, UserSchema } from "@/lib/utils";
// images
import Loader from "@/components/Loader";
import Logo from "@/components/Logo";
import { NavLink, useNavigate } from "react-router-dom";
import { parseISO } from "date-fns";

export default function SignupForm() {
  const { signup } = useSignup();
  const navigate = useNavigate();

  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      surname: "",
      username: "",
      password: "",
      birthday: new Date(),
    },
  });

  async function onSubmit(values: UserType) {
    await signup(values, (err) => {
      form.setError("root.serverError", { message: err });
    });
    // se non ci sono errori nel form possiamo reinderizzare l'utente alla home page
    if (JSON.stringify(form.formState.errors) === "{}") {
      navigate("/home");
    }
  }

  return (
    <Form {...form}>
      <div className="flex flex-col items-center w-full max-w-sm md:max-w-md">
        <Logo className="mb-5" size="md" />

        <h2 className="mb-2 text-center">Sign Up</h2>
        <p className="mb-5">To use Selfie, Please enter your details</p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-1 w-full"
        >
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surname"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Surname</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username *</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
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
                <FormLabel>Date of Birth *</FormLabel>
                <FormControl>
                  {/* Adding Controller api to make sure the input is passed to the hook form correctly*/}
                  <Controller
                    name="birthday"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        onChange={(e) => {
                          field.onChange(parseISO(e.target.value));
                        }}
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

          <Button type="submit" className="mt-4">
            {form.formState.isSubmitting ? <Loader /> : "Sign Up"}
          </Button>

          <p className="text-center mt-4">
            Already have an account?
            <NavLink to="/login" className="text-primary ml-2 hover:underline">
              Log in
            </NavLink>
          </p>
        </form>
      </div>
    </Form>
  );
}
