defmodule TodoNotesWeb.NoteInertiaController do
  use TodoNotesWeb, :controller

  alias TodoNotes.Todos
  alias TodoNotes.Todos.Note

  def index(conn, _params) do
    notes = Todos.list_notes(conn.assigns.current_scope)

    conn
    |> assign(:page_title, "Notes")
    |> assign_prop(:notes, notes)
    |> render_inertia("Notes")
  end

  def new(conn, _params) do
    _changeset =
      Todos.change_note(conn.assigns.current_scope, %Note{
        user_id: conn.assigns.current_scope.user.id
      })

    conn
    |> assign(:page_title, "New Note")
    |> assign_prop(:isEditing, false)
    |> render_inertia("NoteForm")
  end

  def create(conn, %{"note" => note_params}) do
    case Todos.create_note(conn.assigns.current_scope, note_params) do
      {:ok, note} ->
        conn
        |> redirect(to: ~p"/notes-js/#{note}")
        |> put_flash(:info, "Note created successfully.")

      {:error, %Ecto.Changeset{} = changeset} ->
        errors = format_changeset_errors(changeset)

        conn
        |> assign(:page_title, "New Note")
        |> assign_prop(:isEditing, false)
        |> assign_prop(:errors, errors)
        |> render_inertia("NoteForm")
    end
  end

  def show(conn, %{"id" => id}) do
    note = Todos.get_note!(conn.assigns.current_scope, id)

    conn
    |> assign(:page_title, note.title)
    |> assign_prop(:note, note)
    |> render_inertia("NoteShow")
  end

  def edit(conn, %{"id" => id}) do
    note = Todos.get_note!(conn.assigns.current_scope, id)

    conn
    |> assign(:page_title, "Edit Note")
    |> assign_prop(:note, note)
    |> assign_prop(:isEditing, true)
    |> render_inertia("NoteForm")
  end

  def update(conn, %{"id" => id, "note" => note_params}) do
    note = Todos.get_note!(conn.assigns.current_scope, id)

    case Todos.update_note(conn.assigns.current_scope, note, note_params) do
      {:ok, note} ->
        conn
        |> put_flash(:info, "Note updated successfully.")
        |> redirect(to: ~p"/notes-js/#{note}")

      {:error, %Ecto.Changeset{} = changeset} ->
        errors = format_changeset_errors(changeset)

        conn
        |> assign(:page_title, "Edit Note")
        |> assign_prop(:note, note)
        |> assign_prop(:isEditing, true)
        |> assign_prop(:errors, errors)
        |> render_inertia("NoteForm")
    end
  end

  def delete(conn, %{"id" => id}) do
    note = Todos.get_note!(conn.assigns.current_scope, id)
    {:ok, _note} = Todos.delete_note(conn.assigns.current_scope, note)

    conn
    |> put_flash(:info, "Note deleted successfully.")
    |> redirect(to: ~p"/notes-js")
  end

  # Helper to format changeset errors for the frontend
  defp format_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
