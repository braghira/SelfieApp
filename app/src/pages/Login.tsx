import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// components
import { Link } from "react-router-dom";
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
  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: UserType) {
    console.log(values);
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
            {/* <Button
              type="submit"
              className="shad-button_primary flex flex-col gap-5 w-full mt-4"
            >
              Continue without login
            </Button>
            <p className="bg-background px-3 text-muted-foreground mt-4">
              or log in with
            </p> */}
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
              <Link
                to="/auth/forgot-password"
                className="text-light-3 small md:base-regular mt-2 text-link hover:underline cursor-pointer"
              >
                Forgot Password?
              </Link>

              <p className="text-small-regular text-light-2 text-center mt-0">
                Don't have an account yet?
                <Link
                  to="/auth/signup"
                  className="text-primary text-small-semibold ml-2 hover:underline"
                >
                  Register
                </Link>
              </p>
            </form>
          </div>
        </Form>
      </div>
    </div>
  );
}
