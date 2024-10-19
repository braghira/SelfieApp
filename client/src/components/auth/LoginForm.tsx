// hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useLogin from "@/hooks/useLogin";
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

export default function LoginForm() {
  const { login } = useLogin();
  const navigate = useNavigate();

  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: UserType) {
    await login(values.username, values.password, (err) => {
      form.setError("root.serverError", { message: err });
    });
    // se non ci sono errori nel form possiamo reindirizzare l'utente alla home page
    if (JSON.stringify(form.formState.errors) === "{}") {
      navigate("/home");
    }
  }

  return (
    <Form {...form}>
      <div className="flex flex-col items-center w-full max-w-sm md:max-w-md">
        <Logo className="mb-5" size="lg" />

        <h1 className="my-2">Login</h1>
        <p className="mb-5">Organise your life with Selfie!</p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-1 w-full"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
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

          <Button type="submit" className="shad-button_primary mt-4">
            {form.formState.isSubmitting ? <Loader /> : "Login"}
          </Button>

          <p className="mt-4 text-center">
            {"Don't have an account yet?"}
            <NavLink to="/signup" className="text-primary ml-2 hover:underline">
              Sign Up
            </NavLink>
          </p>
        </form>
      </div>
    </Form>
  );
}
