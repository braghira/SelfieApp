import { useState } from 'react';
import { Trash2, Copy, Edit, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';
import useNotes from '@/hooks/useNote';
import { useAuth } from '@/context/AuthContext';
import { marked } from 'marked';
import { useNavigate } from 'react-router-dom';

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  categories: string[];
  createdAt?: Date;
  updatedAt?: Date;
  author: string;
  simplified: boolean;
}

export default function NoteCard({
  id,
  title,
  content,
  categories,
  createdAt,
  updatedAt,
  author,
  simplified,
}: NoteCardProps) {
  const { user } = useAuth();
  const { deleteNote, duplicateNote } = useNotes();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const navigate = useNavigate();

  const markdownContent = marked(content);
  const previewContent =
    content.length > 200 ? `${content.slice(0, 200)}...` : content;

  // Gestione dell'editing della nota
  const handleEdit = () => {
    if (user) {
      navigate(`/editor/${id}`);
    } else {
      console.warn("Utente non autorizzato a modificare la nota.");
    }
  };

  // Gestione dell'eliminazione della nota
  const handleDelete = async () => {
    if (user) {
      await deleteNote(id);
    } else {
      console.warn("Utente non autorizzato a eliminare la nota.");
    }
  };

  // Gestione della duplicazione della nota
  const handleDuplicate = async () => {
    if (user) {
      const duplicatedNote = await duplicateNote(id);
    } else {
      console.warn("Utente non autorizzato a duplicare la nota.");
    }
  };

  // Copia il contenuto negli appunti
  const handleCopyContent = () => {
    navigator.clipboard.writeText(content).then(
      () => console.log("Nota copiata negli appunti"),
      (err) => console.error("Errore nella copia del testo:", err)
    );
  };

  // Gestione della visualizzazione completa della nota
  const handleSeeMore = () => {
    setIsPopupOpen(true);
  };

  // Chiudi il popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };

// Formatta la data
  const formatDate = (date?: Date) =>
    date ? format(date, "dd/MM/yyyy") : "Data non disponibile";

  return (
    <>
      <Card
        className="note-card max-w-full w-full p-4"
        role="article"
        aria-labelledby={`note-title-${id}`}
      >
        <CardHeader className="flex flex-col mb-2">
          {!simplified && (
            <div className="flex space-x-2 mb-2">
              {user && user.username === author && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    aria-label="Modifica nota"
                    title="Modifica nota"
                  >
                    <Edit
                      className="h-5 w-5"
                      aria-hidden="true"
                      focusable="false"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDuplicate}
                    aria-label="Duplica nota"
                    title="Duplica nota"
                  >
                    <Plus
                      className="h-5 w-5"
                      aria-hidden="true"
                      focusable="false"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    aria-label="Elimina nota"
                    title="Elimina nota"
                  >
                    <Trash2
                      className="h-5 w-5"
                      aria-hidden="true"
                      focusable="false"
                    />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyContent}
                aria-label="Copia contenuto della nota"
                title="Copia contenuto della nota"
              >
                <Copy
                  className="h-5 w-5"
                  aria-hidden="true"
                  focusable="false"
                />
              </Button>
            </div>
          )}
          
          <CardTitle id={`note-title-${id}`} className="text-primary mt-2">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-col gap-3">
          <div
            className="text-gray-600 dark:text-white mb-2"
            dangerouslySetInnerHTML={{
              __html: marked(previewContent),
            }}
            role="document"
          />
          {!simplified && content.length > 200 && !isPopupOpen && (
            <span
              onClick={handleSeeMore}
              className="font-bold italic cursor-pointer ml-1 text-red-600 dark:text-red-400"
              role="button"
              aria-label="Vedi tutto il contenuto"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleSeeMore()}
            >
              Vedi di più
            </span>
          )}
          {!simplified && (
            <>
              <div>
                Categories:{" "}
                <span className="font-semibold">{categories.join(", ")}</span>
              </div>
              <div>
                Created:{" "}
                <span className="font-semibold">{formatDate(createdAt)}</span>
              </div>
              <div>
                Updated:{" "}
                <span className="font-semibold">{formatDate(updatedAt)}</span>
              </div>
            </>
          )}
          <div>
            Autore: <span className="font-semibold">{author}</span>
          </div>
        </CardContent>
      </Card>

      {isPopupOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`popup-title-${id}`}
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl max-w-lg w-full relative h-3/4 overflow-y-auto">
            <Button
              onClick={closePopup}
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              aria-label="Chiudi popup"
              title="Chiudi popup"
            >
              <X className="h-6 w-6" aria-hidden="true" focusable="false" />
            </Button>
            <h2 id={`popup-title-${id}`} className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              {title}
            </h2>
            <div
              className="mb-4 text-gray-600 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: markdownContent }}
              role="document"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong>Autore:</strong> {author}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
