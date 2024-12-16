import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { UserType } from "@/lib/utils";
import { Input } from "@/components/ui/input";
//import {  X } from 'lucide-react';

type PropsType = {
  onUserSelect: (username: string) => void; // Funzione callback per passare l'username selezionato
};

/**
 *
 * @param onUserSelect Funzione callback per passare lo username selezionato
 * @returns
 */
export default function UserFinder({ onUserSelect }: PropsType) {
  const [fetchedUsers, setFetchedUsers] = useState<UserType[]>([]);
  const [usernameState, setUsername] = useState("");
  const private_api = useAxiosPrivate();

  // Funzione per cercare utenti
  function onChange(value: string) {
    if (!value) {
      setFetchedUsers([]); // Resetta i risultati se il campo è vuoto
      return;
    }

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

  // Funzione per gestire la selezione dell'utente
  const handleSelectUser = (user: UserType) => {
    onUserSelect(user.username); // Passa l'username selezionato alla callback
    setFetchedUsers([]); // Resetta i suggerimenti dopo la selezione
    setUsername(""); // Resetta l'input di ricerca
  };

  // Effettua la chiamata API quando il valore di username cambia
  useEffect(() => {
    onChange(usernameState);
  }, [usernameState]);

  return (
    <div className="flex flex-col">
      {/* Barra di ricerca con margine e sfondo trasparente adattato al tema */}
      <Input
        type="search"
        value={usernameState}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Search for users"
        className="input input-bordered small-medium mt-4 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600"
      />

      {fetchedUsers.length > 0 && (
        <div className="mt-2 p-2 bg-white/70 dark:bg-gray-800/70 rounded-md shadow-md">
          {fetchedUsers.map((user) => (
            <div
              key={user._id}
              className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => handleSelectUser(user)}
            >
              <strong>{user.username}</strong>
              <div>
                {user.name} {user.surname}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
