import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SigninValidation } from "../lib/utils";
import { z } from "zod";
import Loader from "./Loader";

export default function Login() {
  const isLoading: boolean = true;

  const form = useForm({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: unknown) {
    // Fai qualcosa con i valori del form.
    // ✅ Questo sarà tipo-safe e validato.
    console.log(values);
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img
          src="/assets/images/logo.png"
          alt="logo"
          className="w-12 h-12 rounded-full"
        />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Login</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          Connect, Share, Squeal
        </p>
        <Button
          type="submit"
          className="shad-button_primary flex flex-col gap-5 w-full mt-4"
        >
          {" "}
          continue without login
        </Button>
        <p className="bg-background px-3 text-muted-foreground mt-4">
          or log in with
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="username"
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
            className="shad-button_primary flex flex-col gap-5 w-full mt-4"
          >
            {isLoading ? <Loader /> : "Login"}
          </Button>
          <Link
            to="/forgot-password"
            className="text-small-regular text-light-2 text-link hover:underline cursor-pointer"
          >
            Forgot Password?
          </Link>

          <p className="text-small-regular text-light-2 text-center mt-0">
            Don't have an account yet?
            <Link
              to="/Register"
              className="text-primary-500 text-small-semibold ml-0"
            >
              Register
            </Link>
          </p>
        </form>

        <p className="text-light-3 small md:base-regular mt-2">
          By clicking continue, you agree to our{" "}
          <Link
            to="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </Form>
  );
}
