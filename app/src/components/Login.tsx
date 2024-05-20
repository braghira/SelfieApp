import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { LoginType, LoginSchema } from "../lib/utils";
import Loader from "./Loader";

export default function Login() {
  const form = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginType) {
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
          Organise your life with Selfie!
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
            className="shad-button_primary flex flex-col gap-5 w-full mt-4"
          >
            {form.formState.isSubmitting ? <Loader /> : "Login"}
          </Button>
          <Link
            to="/forgot-password"
            className="text-light-3 small md:base-regular mt-2 text-link hover:underline cursor-pointer"
          >
            Forgot Password?
          </Link>

          <p className="text-small-regular text-light-2 text-center mt-0">
            Don't have an account yet?
            <Link
              to="/Register"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
}
