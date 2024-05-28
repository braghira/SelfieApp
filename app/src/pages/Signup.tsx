import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import useSignup from "@/hooks/useSignup";
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
import { UserSchema, UserType } from "../lib/utils";
import Logo from "@/components/Logo";
import Loader from "../components/Loader";
import Background from "../assets/background.jpg";

export default function Signup() {
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
      console.log("Im navigating my head");
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
            <h1 className="h3-bold md:h2-bold pt-5 sm:pt-12">
              Create a new account
            </h1>
            <p className="text-light-3 small-medium md:base-regular mt-2">
              To use Selfie, Please enter your details
            </p>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5 w-full mt-4"
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
              <Button type="submit" className="shad-button_primary">
                {form.formState.isSubmitting ? <Loader /> : "Sign Up"}
              </Button>
              <p className="text-small-regular text-light-2 text-center mt-2">
                Already have an account?
                <NavLink
                  to="/login"
                  className="text-primary text-small-semibold ml-2 hover:underline"
                >
                  Log in
                </NavLink>
              </p>
            </form>
          </div>
        </Form>
      </div>
    </div>
  );
}
