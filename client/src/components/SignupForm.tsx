// hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { UserType, UserSchema, client_log } from "@/lib/utils";
// images
import Loader from "@/components/Loader";
import Logo from "@/components/Logo";
import { NavLink, useNavigate } from "react-router-dom";

export default function SignupForm() {
  const { signup } = useSignup();
  const navigate = useNavigate();

  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: UserType) {
    await signup(values.email, values.password, (err) => {
      if (err.includes("mail")) {
        form.setError("email", { message: err });
      } else if (err.includes("assword")) {
        form.setError("password", { message: err });
      }
    });
    // se non ci sono errori nel form possiamo reinderizzare l'utente alla home page
    if (JSON.stringify(form.formState.errors) === "{}") {
      client_log("Im navigating my head");
      navigate("/home");
    }
  }

  return (
    <Form {...form}>
      <div className="flex flex-col items-center w-full sm:max-w-md">
        <Logo className="mb-5" />
        <h1 className="my-2 text-center">Create a new account</h1>
        <p className="mb-2">To use Selfie, Please enter your details</p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-1 w-full"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
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
                <FormLabel className="shad-form_label">Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="shad-button_primary shad-button_primary mt-4"
          >
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
