import { router } from '@inertiajs/react';

interface Note {
  id: string;
  title: string;
  body: string;
  due_date?: string;
  tags: string[];
  inserted_at: string;
}

interface NotesProps {
  notes: Note[];
}

export default function Notes({ notes }: NotesProps): JSX.Element {
  function formatDate(dateString?: string): string {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  }

  function deleteNote(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      router.delete(`/notes/${id}`);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
        <button
          onClick={() => router.visit('/notes/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">You don't have any notes yet.</p>
          <button
            onClick={() => router.visit('/notes/new')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                    {note.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.visit(`/notes/${note.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {note.body}
                  </p>
                </div>
                
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700 mr-1">Due:</span> 
                  {formatDate(note.due_date)}
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-400">
                  Created: {new Date(note.inserted_at).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <button
                  onClick={() => router.visit(`/notes/${note.id}`)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
