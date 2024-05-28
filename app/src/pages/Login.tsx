// hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useLogin from "@/hooks/useLogin";
// components
import { NavLink, useNavigate } from "react-router-dom";
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
import { UserType, UserSchema } from "../lib/utils";
// images
import Loader from "../components/Loader";
import Background from "../assets/background.jpg";
import Logo from "@/components/Logo";

export default function Login() {
  const { login } = useLogin();
  const navigate = useNavigate();

  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: UserType) {
    await login(values.email, values.password, (err) => {
      if (err.includes("mail")) {
        form.setError("email", { message: err });
      } else if (err.includes("assword")) {
        form.setError("password", { message: err });
      }
    });
    if (form.formState.isSubmitted) {
      navigate("/");
    }
  }

  return (
    <div className="flex h-screen">
      <div className="hidden bg-black xl:flex xl:w-1/2">
        <img
          src={Background}
          alt="background image"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container flex items-center justify-center xl:w-1/2">
        <Form {...form}>
          <div className="flex flex-col items-center sm:w-full max-w-md">
            <Logo />
            <h1 className="h3-bold md:h2-bold pt-5 sm:pt-12">Login</h1>
            <p className="text-light-3 small-medium md:base-regular mt-2">
              Organise your life with Selfie!
            </p>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5 w-full mt-4"
            >
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
                      <Input
                        type="password"
                        className="shad-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="shad-button_primary flex flex-col gap-5 w-full mt-4"
              >
                {form.formState.isSubmitting ? <Loader /> : "Login"}
              </Button>
              <NavLink
                to="/forgot-password"
                className="text-light-3 small md:base-regular mt-2 text-link hover:underline cursor-pointer"
              >
                Forgot Password?
              </NavLink>

              <p className="text-small-regular text-light-2 text-center mt-0">
                Don't have an account yet?
                <NavLink
                  to="/signup"
                  className="text-primary text-small-semibold ml-2 hover:underline"
                >
                  Sign Up
                </NavLink>
              </p>
            </form>
          </div>
        </Form>
      </div>
    </div>
  );
}
