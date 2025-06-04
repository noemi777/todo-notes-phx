import React, { useState, FormEvent, ChangeEvent, useEffect, FC } from 'react';
import { router } from '@inertiajs/react';

interface Note {
  id?: string;
  title: string;
  body: string;
  due_date?: string;
  tags: string[];
}

interface NoteFormProps {
  note?: Note;
  errors?: Record<string, string>;
  isEditing?: boolean;
}

// Form components inspired by shadcn UI
interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
}

// Simplified form components with consistent styling
const UI = {
  FormLabel: ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none">{children}</label>
  ),
  
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">{children}</div>
  ),
  
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div className="mt-2 relative">{children}</div>
  ),
  
  FormDescription: ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-slate-500">{children}</p>
  ),
  
  FormMessage: ({ children }: { children?: React.ReactNode }) => (
    children ? <p className="text-sm font-medium text-red-500">{children}</p> : null
  )
};

// Reusable form field component
const FormField: FC<FormFieldProps> = ({ label, name, error, description, children }) => (
  <UI.FormItem>
    <UI.FormLabel htmlFor={name}>{label}</UI.FormLabel>
    <UI.FormControl>{children}</UI.FormControl>
    {description && <UI.FormDescription>{description}</UI.FormDescription>}
    {error && <UI.FormMessage>{error}</UI.FormMessage>}
  </UI.FormItem>
);

// Character counter with progress bar
interface CharCounterProps {
  current: number;
  max: number;
}

const CharCounter: FC<CharCounterProps> = ({ current, max }) => {
  const percentage = (current / max) * 100;
  const textColor = percentage < 75 ? 'text-slate-500' : percentage < 90 ? 'text-amber-500' : 'text-red-500';
  const bgColor = percentage < 75 ? 'bg-slate-500' : percentage < 90 ? 'bg-amber-500' : 'bg-red-500';
  
  return (
    <div className="mt-1 space-y-1">
      <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${bgColor}`} style={{ width: `${Math.min(100, percentage)}%` }} />
      </div>
      <div className={`text-xs text-right ${textColor}`}>{current}/{max}</div>
    </div>
  );
};

// Tag component
interface TagProps {
  text: string;
  onRemove: () => void;
}

const Tag: FC<TagProps> = ({ text, onRemove }) => (
  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
    {text}
    <button 
      type="button" 
      onClick={onRemove} 
      className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none"
    >
      <span className="sr-only">Remove tag</span>
      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
      </svg>
    </button>
  </span>
);

export default function NoteForm({ note, errors = {}, isEditing = false }: NoteFormProps): JSX.Element {
  const [values, setValues] = useState<Note>({
    title: note?.title || '',
    body: note?.body || '',
    due_date: note?.due_date || '',
    tags: note?.tags || [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({
    title: '',
    body: '',
    due_date: ''
  });
  
  const [isFormValid, setIsFormValid] = useState(false);
  
  const [titleChars, setTitleChars] = useState(values.title.length);
  const [bodyChars, setBodyChars] = useState(values.body.length);
  
  const MAX_TITLE_LENGTH = 100;
  const MAX_BODY_LENGTH = 200;
  
  const [newTag, setNewTag] = useState('');
  
  useEffect(() => {
    validateForm();
  }, [values]);

  function validateForm(): void {
    const newErrors: Record<string, string> = {};
    
    if (!values.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (values.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
    }
    
    if (values.body.length > MAX_BODY_LENGTH) {
      newErrors.body = `Content must be ${MAX_BODY_LENGTH} characters or less`;
    }
    
    if (values.due_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(values.due_date);
      
      if (selectedDate < today) {
        newErrors.due_date = 'Due date cannot be in the past';
      }
    }
    
    setValidationErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }
  
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { name, value } = e.target;
    
    if (name === 'title') {
      setTitleChars(value.length);
    } else if (name === 'body') {
      setBodyChars(value.length);
    }
    
    setValues(values => ({
      ...values,
      [name]: value,
    }));
  }

  function handleTagChange(e: ChangeEvent<HTMLInputElement>): void {
    setNewTag(e.target.value);
  }
  function addTag(e?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>): void {
    if (e) e.preventDefault();
    if (newTag.trim() !== '') {
      setValues(values => ({
        ...values,
        tags: [...values.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  }

  function removeTag(index: number): void {
    setValues(values => ({
      ...values,
      tags: values.tags.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    
    validateForm();
    
    if (isFormValid) {
      if (isEditing && note?.id) {
        router.put(`/notes-js/${note.id}`, { note: values as Record<string, any> });
      } else {
        router.post('/notes-js', { note: values as Record<string, any> });
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">
        {isEditing ? 'Edit Note' : 'Create New Note'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Title"
          name="title"
          error={validationErrors.title || errors?.title}
          description="Give your note a clear, descriptive title."
        >
          <input
            type="text"
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            className={`flex h-10 w-full rounded-md border ${validationErrors.title ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-slate-950'} bg-background px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            placeholder="Note title"
          />
          <div className="flex justify-between mt-1">
            <CharCounter current={titleChars} max={MAX_TITLE_LENGTH} />
          </div>
        </FormField>

        <FormField
          label="Content"
          name="body"
          error={validationErrors.body || errors?.body}
          description="Add details, notes, or any additional information."
        >
          <textarea
            id="body"
            name="body"
            value={values.body}
            onChange={handleChange}
            rows={4}
            className={`flex w-full rounded-md border ${validationErrors.body ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-slate-950'} bg-background px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-none`}
            placeholder="Write your note content here..."
          />
          <div className="flex justify-between mt-1">
            <CharCounter current={bodyChars} max={MAX_BODY_LENGTH} />
          </div>
        </FormField>

        <FormField 
          label="Due Date" 
          name="due_date" 
          error={validationErrors.due_date || errors?.due_date}
        >
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={values.due_date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`flex h-10 w-full rounded-md border ${validationErrors.due_date ? 'border-red-300 focus-visible:ring-red-500' : 'border-slate-200 focus-visible:ring-slate-950'} bg-background px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
          />
        </FormField>

        <FormField
          label="Tags"
          name="tags"
          error={errors?.tags}
          description="Add keywords to help organize your notes."
        >
          <div className="flex rounded-md">
            <input
              type="text"
              id="tagInput"
              value={newTag}
              onChange={handleTagChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1 min-w-0 h-10 w-full rounded-l-md border border-slate-200 bg-background px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="inline-flex items-center justify-center h-10 rounded-r-md border border-l-0 border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 focus:z-10 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Add
            </button>
          </div>
          {values.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {values.tags.map((tag, index) => (
                <Tag key={index} text={tag} onRemove={() => removeTag(index)} />
              ))}
            </div>
          )}
        </FormField>

        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.visit('/notes-js')}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-background hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!values.title.trim() || Object.keys(validationErrors).length > 0}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 h-10 px-4 py-2 ${!values.title.trim() || Object.keys(validationErrors).length > 0 ? 
              'bg-slate-400 text-slate-50 cursor-not-allowed' : 
              'bg-slate-900 text-slate-50 hover:bg-slate-800 focus-visible:ring-slate-950'}`}
          >
            {isEditing ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
