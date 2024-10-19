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
import { useNavigate } from "react-router-dom";
import { parseISO } from "date-fns";
import { useState, useEffect } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useAuth } from "@/context/AuthContext";
import { isAxiosError } from "axios";
import { Separator } from "@/components/ui/separator";

export default function Account() {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const private_api = useAxiosPrivate();
  const { user } = useAuth();

  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      username: "",
      birthday: new Date(),
      profilePic: "", // Immagine profilo dell'utente
    },
  });

  useEffect(() => {
    form.reset(user); // Precompila i campi con i dati utente
    console.log(user);
  }, [form]);

  async function uploadProfileImage(file: File) {
    const formData = new FormData();

    // Converti il file in un formato compatibile
    formData.append("data", file); // Il file sarà automaticamente convertito in un buffer dal backend
    formData.append("name", file.name); // Nome del file
    formData.append("mimetype", file.type); // Tipo MIME del file

    try {
      const response = await private_api.post("/api/media/", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Importante per inviare il FormData
        },
      });

      if (response.status === 200) {
        console.log("New media ID: ", response.data);
        return response.data; // Restituisce l'ID del media salvato
      }
    } catch (error) {
      if (isAxiosError(error))
        console.error("Errore nel caricamento dell'immagine: ", error.message);
    }
  }

  async function onSubmit(values: UserType) {
    try {
      const updatedValues = { ...values };

      if (profileImage) {
        const profilePicId = await uploadProfileImage(profileImage);
        updatedValues.profilePic = profilePicId;
      }

      await private_api.patch("/auth/signup", updatedValues);

      navigate("/home");
    } catch (error) {
      form.setError("root.serverError", { message: (error as Error).message });
    }
  }

  return (
    <>
      <h3 className="text-lg font-medium">Account</h3>
      <p className="text-sm text-muted-foreground">
        Manage your account settings and set Push Notifications preferences.
      </p>

      <Separator className="my-4" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel className="text-gray-800 dark:text-gray-100">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      aria-label="Name"
                      className="text-sm md:text-base"
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
                <FormItem className="w-full md:w-1/2">
                  <FormLabel className="text-gray-800 dark:text-gray-100">
                    Surname
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      aria-label="Surname"
                      className="text-sm md:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800 dark:text-gray-100">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    aria-label="Email"
                    className="text-sm md:text-base"
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
                <FormLabel className="text-gray-800 dark:text-gray-100">
                  Date of Birth
                </FormLabel>
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
                        className="text-sm md:text-base"
                      />
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel className="text-gray-800 dark:text-gray-100">
              Profile Picture
            </FormLabel>
            <FormControl>
              <Input
                type="file"
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                aria-label="Profile Picture"
                className="text-sm md:text-base"
              />
            </FormControl>
          </FormItem>

          {/* {subscription ? (
              <Button
                disabled={unsubLoading}
                className="bg-blue-900 hover:bg-blue-800"
                onClick={() => {
                  if (user?._id) unsubscribe(user?._id);
                }}
              >
                {unsubLoading ? (
                  <Loader />
                ) : (
                  <div className="flex gap-1">
                    <Bell /> Unsubscribe
                  </div>
                )}
              </Button>
            ) : (
              <Button
                disabled={subLoading}
                className="bg-blue-900 hover:bg-blue-800"
                onClick={async () => {
                  if (user?._id) RequestPushSub(() => subscribe(user._id));
                }}
              >
                {subLoading ? (
                  <Loader />
                ) : (
                  <div className="flex gap-1">
                    <Bell /> Subscribe
                  </div>
                )}
              </Button>
            )} */}

          <Button
            type="submit"
            className="mt-4 w-full md:w-auto"
            aria-label="Save Changes"
          >
            {form.formState.isSubmitting ? <Loader /> : "Save Changes"}
          </Button>
        </form>
      </Form>
    </>
  );
}
