import { useEffect, useMemo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import NoteCard from '@/components/editor/notecard';
import { useNoteContext } from '@/context/NoteContext';
import useNotes from '@/hooks/useNote';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { NoteType } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

function HomeNote() {
  const { notes, dispatch } = useNoteContext();
  const { fetchNotes, deleteAllNotes } = useNotes();
  const [sortOption, setSortOption] = useState<string>("default");
  const navigate = useNavigate();

  // Funzione per caricare le note dal server
  const loadNotes = useCallback(async () => {
    try {
      const fetched = await fetchNotes();
      dispatch({ type: "SET_NOTES", payload: fetched });
      console.log("Note caricate con successo!");
    } catch (error) {
      console.error("Errore nel caricamento delle note:", error instanceof Error ? error.message : "Errore sconosciuto");
    }
  }, [dispatch, fetchNotes]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Funzione per ordinare le note
  const sortedNotes = useMemo(() => {
    const sortNotes = (notes: NoteType[], option: string): NoteType[] => {
      return [...notes].sort((a, b) => {
        switch (option) {
          case 'title':
            return a.title.localeCompare(b.title);
          case "date": {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Ordina dalla più recente alla più vecchia
          }

          
          case "length":
            return b.content.length - a.content.length;
          default:
            return 0;
        }
      });
    };
    return sortNotes(notes, sortOption);
  }, [notes, sortOption]);

  // Funzione per creare una nuova nota
  const handleCreateNewNote = () => {
    navigate("/editor");
    console.log("Navigato verso la pagina di creazione della nota.");
  };

  // Funzione per eliminare tutte le note
  const handleDeleteAllNotes = async () => {
    try {
      await deleteAllNotes();
      dispatch({ type: "DELETE_ALL_NOTES" });
      console.log("Tutte le note sono state eliminate con successo!");
    } catch (error) {
      console.error("Errore nell'eliminazione delle note:", error instanceof Error ? error.message : "Errore sconosciuto");
    }
  };

  // Funzione per cambiare l'ordinamento
  const handleSortChange = (option: string) => {
    setSortOption(option);
    console.log(`Opzione di ordinamento cambiata a: ${option}`);
  };

  return (
    <div className="view-container px-4">
      <div className="flex justify-start items-center space-x-4 mb-4">
        <Button onClick={handleCreateNewNote} aria-label="Crea una nuova nota">
          Nuova Nota
        </Button>
        <Button onClick={handleDeleteAllNotes} aria-label="Elimina tutte le note">
          Elimina Tutte le Note
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Ordina per</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSortChange("title")} aria-label="Ordina per titolo">
              Titolo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("date")} aria-label="Ordina per data">
              Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("length")} aria-label="Ordina per lunghezza">
              Lunghezza
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="note-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <NoteCard
              key={note._id}
              id={note._id as string}
              title={note.title}
              content={note.content}
              categories={note.categories}
              createdAt={note.createdAt}
              updatedAt={note.updatedAt}
              author={note.author} // Passa anche l'autore
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