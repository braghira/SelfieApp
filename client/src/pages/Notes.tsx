import { useEffect, useMemo, useCallback, useState } from "react";
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
import { NoteType } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

function HomeNote() {
  const { notes } = useNoteContext(); // Ora notes viene direttamente dal contesto
  const { fetchNotes, deleteAllNotes } = useNotes();
  const { user } = useAuth();
  const [sortOption, setSortOption] = useState<string>('default');
  const [showOnlyOwnNotes, setShowOnlyOwnNotes] = useState(false); // Stato per il filtro delle note
  const navigate = useNavigate();

  // Carica le note dal server al montaggio del componente
  const loadNotes = useCallback(async () => {
    try {
      await fetchNotes(); // Non è necessario il dispatch, fetchNotes aggiorna direttamente il contesto
    } catch (error) {
      console.error('Errore nel caricamento delle note:', error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  }, [fetchNotes]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Ordina le note
  const sortedNotes = useMemo(() => {
    const sortNotes = (notes: NoteType[], option: string): NoteType[] => {
      return [...notes].sort((a, b) => {
        switch (option) {
          case "title":
            return a.title.localeCompare(b.title);
          case 'date': {
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

  // Filtra le note per autore
  const filteredNotes = useMemo(() => {
    return showOnlyOwnNotes ? sortedNotes.filter(note => note.author === user?.username) : sortedNotes;
  }, [sortedNotes, showOnlyOwnNotes, user]);

  // Crea una nuova nota
  const handleCreateNewNote = () => {
    navigate('/editor');
  };

  // Elimina tutte le note
  const handleDeleteAllNotes = async () => {
    try {
      await deleteAllNotes();
      // Il contesto viene aggiornato da useNotes, quindi non serve il dispatch qui
    } catch (error) {
      console.error('Errore nell\'eliminazione delle note:', error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  };

  // Cambia l'ordinamento
  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  // Toggle per mostrare solo le proprie note
  const toggleShowOwnNotes = () => {
    setShowOnlyOwnNotes(prev => !prev);
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
            <Button aria-haspopup="listbox" aria-expanded="false">Ordina per</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSortChange('title')} aria-label="Ordina per titolo">
              Titolo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('date')} aria-label="Ordina per data">
              Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('length')} aria-label="Ordina per lunghezza">
              Lunghezza
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={toggleShowOwnNotes} aria-label="Mostra solo le tue note">
          {showOnlyOwnNotes ? 'Mostra tutte le note' : 'Mostra solo le tue note'}
        </Button>
      </div>

      <div className="note-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => (
            <NoteCard
              key={note._id}
              id={note._id as string}
              title={note.title}
              content={note.content}
              categories={note.categories}
              createdAt={note.createdAt}
              updatedAt={note.updatedAt}
              author={note.author}
              simplified={false}
            />
          ))
        ) : (
          <p aria-live="polite">Nessuna nota disponibile.</p>
        )}
      </div>
    </div>
  );
}

export default HomeNote;
