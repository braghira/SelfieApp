import { useState } from 'react';
import { Trash2, Copy, Edit, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';
import useNotes from '@/hooks/useNote';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  const previewContent = content.length > 200 ? `${content.slice(0, 200)}...` : content;

  const handleEdit = () => {
    if (user) {
      navigate(`/editor/${id}`);
    } else {
      console.warn("User not authorized to edit the note.");
    }
  };

  const handleDelete = async () => {
    if (user) {
      deleteNote(id);
    } else {
      console.warn("User not authorized to delete the note.");
    }
  };

  const handleDuplicate = async () => {
    if (user) {
      duplicateNote(id);
    } else {
      console.warn("User not authorized to duplicate the note.");
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content).then(
      () => console.log("Note copied to clipboard"),
      (err) => console.error("Error copying text:", err)
    );
  };

  const handleSeeMore = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const formatDate = (date?: Date) =>
    date ? format(date, "dd/MM/yyyy") : "Date not available";

  return (
    <>
      <Card
        className="note-card max-w-full w-full p-4"
        role="article"
        aria-labelledby={`note-title-${id}`}
      >
        <CardHeader className="flex flex-col mb-1">
          {!simplified && (
            <div className="flex space-x-2 mb-2">
              {user && user.username === author && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEdit}
                    aria-label="Edit note"
                    title="Edit note"
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
                    aria-label="Duplicate note"
                    title="Duplicate note"
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
                    aria-label="Delete note"
                    title="Delete note"
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
                aria-label="Copy note content"
                title="Copy note content"
              >
                <Copy
                  className="h-5 w-5"
                  aria-hidden="true"
                  focusable="false"
                />
              </Button>
            </div>
          )}
          <CardTitle
            id={`note-title-${id}`}
            className="text-primary mb-1 text-ellipsis overflow-hidden whitespace-normal break-words"
            style={{ lineHeight: "1.2", paddingBottom: "4px" }}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 dark:text-white">
          <div className="mb-2 text-ellipsis overflow-hidden whitespace-normal break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewContent}</ReactMarkdown>
          </div>
          {!simplified && content.length > 200 && !isPopupOpen && (
            <span
              onClick={handleSeeMore}
              className="font-bold italic cursor-pointer ml-1 text-red-600 dark:text-red-400"
            >
              See more
            </span>
          )}
          {!simplified && (
            <>
              <div className="mt-2">
                Categories:{" "}
                <span className="font-semibold">{categories.join(", ")}</span>
              </div>
              <div className="mt-1">
                Created:{" "}
                <span className="font-semibold">{formatDate(createdAt)}</span>
              </div>
              <div className="mt-1">
                Updated:{" "}
                <span className="font-semibold">{formatDate(updatedAt)}</span>
              </div>
            </>
          )}
          <div className="mt-2">
            Author: <span className="font-semibold">{author}</span>
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
              aria-label="Close popup"
              title="Close popup"
            >
              <X className="h-6 w-6" aria-hidden="true" focusable="false" />
            </Button>
            <h2
              id={`popup-title-${id}`}
              className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100"
            >
              {title}
            </h2>
            <div className="mb-4 text-gray-600 dark:text-gray-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong>Author:</strong> {author}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
