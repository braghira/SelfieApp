import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import NoteCard from "@/components/editor/notecard";
import { useNoteContext } from "@/context/NoteContext";
import useNotes from "@/hooks/useNote";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Note {
  _id?: string;
  title: string;
  content: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
  author: string;
}

function HomeNote() {
  const { dispatch } = useNoteContext();
  const { fetchNotes, deleteAllNotes } = useNotes();
  const [fetchedNotes, setFetchedNotes] = useState<Note[]>([]);
  const [sortOption, setSortOption] = useState<string>("default");

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const fetched = await fetchNotes();
        setFetchedNotes(fetched);
        dispatch({ type: "SET_NOTES", payload: fetched });
        console.log("Note caricate con successo!");
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Errore nel caricamento delle note:", error.message);
        } else {
          console.error(
            "Errore sconosciuto nel caricamento delle note:",
            error
          );
        }
      }
    };

    loadNotes();
  }, [dispatch, fetchNotes]);

  const sortedNotes = useMemo(() => {
    const sortNotes = (notes: Note[], option: string) => {
      return [...notes].sort((a, b) => {
        switch (option) {
          case "title":
            return a.title.localeCompare(b.title);
          case "date":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "length":
            return b.content.length - a.content.length;
          default:
            return 0;
        }
      });
    };
    return sortNotes(fetchedNotes, sortOption);
  }, [fetchedNotes, sortOption]);

  const handleCreateNewNote = () => {
    window.location.href = "/editor";
    console.log("Navigato verso la pagina di creazione della nota.");
  };

  const handleDeleteAllNotes = async () => {
    try {
      await deleteAllNotes();
      dispatch({ type: "DELETE_ALL_NOTES" });
      setFetchedNotes([]);
      console.log("Tutte le note sono state eliminate con successo!");
    } catch (error) {
      console.error("Errore nell'eliminazione delle note:", error);
    }
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
    console.log(`Opzione di ordinamento cambiata a: ${option}`);
  };

  return (
    <div className="home-note p-4">
      <div className="flex justify-start items-center space-x-4 mb-4">
        <Button onClick={handleCreateNewNote} aria-label="Crea una nuova nota">
          Nuova Nota
        </Button>
        <Button
          onClick={handleDeleteAllNotes}
          aria-label="Elimina tutte le note"
        >
          Elimina Tutte le Note
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Apri il menu di ordinamento">Ordina per</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => handleSortChange("title")}
              aria-label="Ordina per titolo"
            >
              Titolo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange("date")}
              aria-label="Ordina per data"
            >
              Data
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange("length")}
              aria-label="Ordina per lunghezza"
            >
              Lunghezza
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="note-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <NoteCard
              key={note._id || ""}
              id={note._id || ""}
              title={note.title}
              content={note.content}
              categories={note.categories}
              createdAt={note.createdAt}
              updatedAt={note.updatedAt}
              author={note.author}
            />
          ))
        ) : (
          <p>Nessuna nota disponibile.</p>
        )}
      </div>
    </div>
  );
}

export default HomeNote;
