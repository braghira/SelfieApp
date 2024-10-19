import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserType, UserSchema } from "@/lib/utils";
import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useAuth } from "@/context/AuthContext";
import { isAxiosError } from "axios";
import { Separator } from "@/components/ui/separator";
import useUpdateProfile from "@/hooks/useUpdateProfile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export default function TakeASelfie() {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const private_api = useAxiosPrivate();
  const { user } = useAuth();
  const { updateProfile } = useUpdateProfile();

  const form = useForm<UserType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
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
    const updatedValues = { ...values };

    if (profileImage) {
      const profilePicId = await uploadProfileImage(profileImage);
      // Add uri
      updatedValues.profilePic = `api/media/${profilePicId}`;

      console.log("Profile: ", updatedValues);

      await updateProfile(updatedValues, (err) => {
        form.setError("root.serverError", { message: err });
      });
    }

    form.setError("root.serverError", { message: "No file Selected" });
  }

  return (
    <>
      <h3 className="text-lg font-medium">Take A Selfie</h3>
      <p className="text-sm text-muted-foreground">
        Here you can upload a photo for your profile, or you can take one
        instead!
      </p>

      <Separator className="my-4" />

      <Card className="my-4">
        <CardHeader>
          <CardDescription>Current Profile Photo</CardDescription>

          <CardContent className="flex-center">
            <img
              src={`${import.meta.env.VITE_BASE_URL}${user?.profilePic}`}
              width={"300px"}
              className="border-4 rounded-sm"
            />
          </CardContent>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
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

          {/* Server errors */}
          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive space-y-2">
              {form.formState.errors.root.serverError.message}
            </div>
          )}

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
