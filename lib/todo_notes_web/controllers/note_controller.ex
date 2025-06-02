defmodule TodoNotesWeb.NoteController do
  use TodoNotesWeb, :controller

  alias TodoNotes.Todos
  alias TodoNotes.Todos.Note

  def index(conn, _params) do
    notes = Todos.list_notes(conn.assigns.current_scope)
    render(conn, :index, notes: notes)
  end

  def new(conn, _params) do
    changeset =
      Todos.change_note(conn.assigns.current_scope, %Note{
        user_id: conn.assigns.current_scope.user.id
      })

    render(conn, :new, changeset: changeset)
  end

  def create(conn, %{"note" => note_params}) do
    case Todos.create_note(conn.assigns.current_scope, note_params) do
      {:ok, note} ->
        conn
        |> put_flash(:info, "Note created successfully.")
        |> redirect(to: ~p"/notes/#{note}")

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, :new, changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    note = Todos.get_note!(conn.assigns.current_scope, id)
    render(conn, :show, note: note)
  end

  def edit(conn, %{"id" => id}) do
    note = Todos.get_note!(conn.assigns.current_scope, id)
    changeset = Todos.change_note(conn.assigns.current_scope, note)
    render(conn, :edit, note: note, changeset: changeset)
  end

  def update(conn, %{"id" => id, "note" => note_params}) do
    note = Todos.get_note!(conn.assigns.current_scope, id)

    case Todos.update_note(conn.assigns.current_scope, note, note_params) do
      {:ok, note} ->
        conn
        |> put_flash(:info, "Note updated successfully.")
        |> redirect(to: ~p"/notes/#{note}")

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, :edit, note: note, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    note = Todos.get_note!(conn.assigns.current_scope, id)
    {:ok, _note} = Todos.delete_note(conn.assigns.current_scope, note)

    conn
    |> put_flash(:info, "Note deleted successfully.")
    |> redirect(to: ~p"/notes")
  end
end
