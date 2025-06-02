defmodule TodoNotes.Todos do
  @moduledoc """
  The Todos context.
  """

  import Ecto.Query, warn: false
  alias TodoNotes.Repo

  alias TodoNotes.Todos.Note
  alias TodoNotes.Accounts.Scope

  @doc """
  Subscribes to scoped notifications about any note changes.

  The broadcasted messages match the pattern:

    * {:created, %Note{}}
    * {:updated, %Note{}}
    * {:deleted, %Note{}}

  """
  def subscribe_notes(%Scope{} = scope) do
    key = scope.user.id

    Phoenix.PubSub.subscribe(TodoNotes.PubSub, "user:#{key}:notes")
  end

  defp broadcast(%Scope{} = scope, message) do
    key = scope.user.id

    Phoenix.PubSub.broadcast(TodoNotes.PubSub, "user:#{key}:notes", message)
  end

  @doc """
  Returns the list of notes.

  ## Examples

      iex> list_notes(scope)
      [%Note{}, ...]

  """
  def list_notes(%Scope{} = scope) do
    Repo.all(from note in Note, where: note.user_id == ^scope.user.id)
  end

  @doc """
  Gets a single note.

  Raises `Ecto.NoResultsError` if the Note does not exist.

  ## Examples

      iex> get_note!(123)
      %Note{}

      iex> get_note!(456)
      ** (Ecto.NoResultsError)

  """
  def get_note!(%Scope{} = scope, id) do
    Repo.get_by!(Note, id: id, user_id: scope.user.id)
  end

  @doc """
  Creates a note.

  ## Examples

      iex> create_note(%{field: value})
      {:ok, %Note{}}

      iex> create_note(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_note(%Scope{} = scope, attrs) do
    with {:ok, note = %Note{}} <-
           %Note{}
           |> Note.changeset(attrs, scope)
           |> Repo.insert() do
      broadcast(scope, {:created, note})
      {:ok, note}
    end
  end

  @doc """
  Updates a note.

  ## Examples

      iex> update_note(note, %{field: new_value})
      {:ok, %Note{}}

      iex> update_note(note, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_note(%Scope{} = scope, %Note{} = note, attrs) do
    true = note.user_id == scope.user.id

    with {:ok, note = %Note{}} <-
           note
           |> Note.changeset(attrs, scope)
           |> Repo.update() do
      broadcast(scope, {:updated, note})
      {:ok, note}
    end
  end

  @doc """
  Deletes a note.

  ## Examples

      iex> delete_note(note)
      {:ok, %Note{}}

      iex> delete_note(note)
      {:error, %Ecto.Changeset{}}

  """
  def delete_note(%Scope{} = scope, %Note{} = note) do
    true = note.user_id == scope.user.id

    with {:ok, note = %Note{}} <-
           Repo.delete(note) do
      broadcast(scope, {:deleted, note})
      {:ok, note}
    end
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking note changes.

  ## Examples

      iex> change_note(note)
      %Ecto.Changeset{data: %Note{}}

  """
  def change_note(%Scope{} = scope, %Note{} = note, attrs \\ %{}) do
    true = note.user_id == scope.user.id

    Note.changeset(note, attrs, scope)
  end
end
