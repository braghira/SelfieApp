import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { UserSchema, UserType } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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

/**
 * - [ ] Form per cercare utenti da aggiungere alla lista degli amici
 * - [ ] Ad ogni digitazione nell'input di ricerca viene fatta una fetch degli utenti che contengono il valore del campo nello username
 * - [ ] Vengono consigliati utenti sotto alla barra in base al contenuto del campo, e sono cliccabili per un autocompletamento
 * - [ ] Gli utenti selezionati vengono mostrati sotto alla barra di ricerca
 * - [ ] Il componente dovrebbe aggiornare l'array degli utenti selezionati passato come prop
 * in questo modo si possono inviare facilmente al backend sia richieste che notifiche
 */

const FormSchema = z.object({
  username: z.string().toLowerCase().min(1),
});

type username = z.infer<typeof FormSchema>;

type PropsType = {
  userList: UserType[];
  setUsersList: React.Dispatch<React.SetStateAction<UserType[]>>;
};

export default function UsersSearchBar({ userList, setUsersList }: PropsType) {
  // Users initialized as an empty array
  const [fetchedUsers, setFetchedUsers] = useState<UserType[]>([]);
  const [usernameState, setUsername] = useState("");
  const private_api = useAxiosPrivate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  // GET matching users for easy search
  function onChange(value: string) {
    private_api
      .get(`/api/users/${value}`)
      .then((response) => {
        if (response.status === 200) {
          setFetchedUsers(response.data);
        }
      })
      .catch(() => {
        setFetchedUsers([]);
        console.error("Couldn't fetch matching users");
      });
  }

  // submit a username and update the props' state
  async function onSubmit(value: username) {
    // API should return an array of users
    const response = await private_api.get(`/api/users/${value.username}`);

    if (response.status === 200) {
      setUsersList(response.data);
    } else {
      console.error("Couldn't add matching users");
    }
  }

  // Effettua la chiamata API quando il valore di username cambia
  useEffect(() => {
    if (usernameState) {
      onChange(usernameState);
    } else {
      setFetchedUsers([]); // Resetta i risultati se il campo è vuoto
    }
  }, [usernameState]);

  return (
    <div className="flex flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="username"
            render={() => (
              <FormItem>
                <FormLabel>Search for users to add</FormLabel>
                <FormControl>
                  <Controller
                    name="username"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        type="search"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setUsername(e.target.value);
                        }}
                      />
                    )}
                  />
                </FormControl>
                {fetchedUsers.map((user) => (
                  <div key={user._id}>
                    <strong>{user.username}</strong>
                    <div>
                      {user.name} {user.surname}
                    </div>
                  </div>
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add</Button>
        </form>
      </Form>
    </div>
  );
}
