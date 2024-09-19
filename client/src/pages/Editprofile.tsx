import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserType, UserSchema } from "@/lib/utils";
import Loader from "@/components/Loader";
import { useNavigate } from "react-router-dom";
import { parseISO } from "date-fns";
import { useState, useEffect } from "react";

export default function EditProfileForm() {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<File | null>(null);

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
    async function fetchUserData() {
      const response = await fetch("/api/user/me");
      const data = await response.json();
      form.reset(data); // Precompila i campi con i dati utente
    }
    fetchUserData();
  }, [form]);

  async function uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("mimetype", file.type);

    const response = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const mediaData = await response.json();
    return mediaData._id;
  }

  async function onSubmit(values: UserType) {
    try {
      const updatedValues = { ...values };

      if (profileImage) {
        const profilePicId = await uploadProfileImage(profileImage);
        updatedValues.profilePic = profilePicId;
      }

      await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedValues),
      });

      navigate("/home");
    } catch (error) {
      form.setError("root.serverError", { message: (error as Error).message });
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 md:p-0 bg-gray-100 dark:bg-gray-900">
      <Form {...form}>
        <div className="flex flex-col items-center w-full max-w-sm md:max-w-lg bg-white dark:bg-gray-800 p-6 md:p-8 shadow-md rounded-md">
          <img
            src={form.getValues('profilePic') || "/placeholder-profile.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-5"
          />

          <h2 className="mb-4 text-center text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Edit Profile
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/2">
                    <FormLabel className="text-gray-800 dark:text-gray-100">Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} aria-label="Name" className="text-sm md:text-base" />
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
                    <FormLabel className="text-gray-800 dark:text-gray-100">Surname</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} aria-label="Surname" className="text-sm md:text-base" />
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
                  <FormLabel className="text-gray-800 dark:text-gray-100">Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} aria-label="Email" className="text-sm md:text-base" />
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
                  <FormLabel className="text-gray-800 dark:text-gray-100">Date of Birth</FormLabel>
                  <FormControl>
                    <Controller
                      name="birthday"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          type="date"
                          value={field.value?.toISOString().split("T")[0] || ""}
                          onChange={(e) => field.onChange(parseISO(e.target.value))}
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
              <FormLabel className="text-gray-800 dark:text-gray-100">Profile Picture</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                  aria-label="Profile Picture"
                  className="text-sm md:text-base"
                />
              </FormControl>
            </FormItem>

            <Button type="submit" className="mt-4 w-full md:w-auto" aria-label="Save Changes">
              {form.formState.isSubmitting ? <Loader /> : "Save Changes"}
            </Button>
          </form>
        </div>
      </Form>
    </div>
  );
}
