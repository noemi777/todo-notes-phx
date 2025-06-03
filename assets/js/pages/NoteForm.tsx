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

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}

const FormField: FC<FormFieldProps> = ({ label, name, error, children }) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

interface CharCounterProps {
  current: number;
  max: number;
}

const CharCounter: FC<CharCounterProps> = ({ current, max }) => {
  const isOverLimit = current > max;
  
  return (
    <div className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
      {current}/{max}
    </div>
  );
};

interface TagProps {
  tag: string;
  onRemove: () => void;
}

const Tag: FC<TagProps> = ({ tag, onRemove }) => {
  return (
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
      {tag}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-600"
      >
        &times;
      </button>
    </div>
  );
};

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
  function addTag(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();
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
        router.put(`/notes/${note.id}`, { note: values as Record<string, any> });
      } else {
        router.post('/notes', { note: values as Record<string, any> });
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Note' : 'Create New Note'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 p-2 ${validationErrors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
            maxLength={MAX_TITLE_LENGTH}
            required
          />
          <div className="flex justify-between mt-1">
            <div>
              {(validationErrors.title || errors.title) && (
                <p className="text-sm text-red-600">{validationErrors.title || errors.title}</p>
              )}
            </div>
            <CharCounter current={titleChars} max={MAX_TITLE_LENGTH} />
          </div>
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="body"
            name="body"
            rows={4}
            value={values.body}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 p-2 ${validationErrors.body ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
            maxLength={MAX_BODY_LENGTH}
            required
          />
          <div className="flex justify-between mt-1">
            <div>
              {(validationErrors.body || errors.body) && (
                <p className="text-sm text-red-600">{validationErrors.body || errors.body}</p>
              )}
            </div>
            <CharCounter current={bodyChars} max={MAX_BODY_LENGTH} />
          </div>
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={values.due_date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 p-2 ${validationErrors.due_date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'}`}
          />
          {(validationErrors.due_date || errors.due_date) && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.due_date || errors.due_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="flex mt-1">
            <input
              type="text"
              value={newTag}
              onChange={handleTagChange}
              placeholder="Add a tag"
              className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            />
            <button
              onClick={addTag}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
          
          {values.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {values.tags.map((tag, index) => (
                <Tag 
                  key={index} 
                  tag={tag} 
                  onRemove={() => removeTag(index)} 
                />
              ))}
            </div>
          )}
          {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.visit('/notes')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!values.title.trim() || Object.keys(validationErrors).length > 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${!values.title.trim() || Object.keys(validationErrors).length > 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
          >
            {isEditing ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
