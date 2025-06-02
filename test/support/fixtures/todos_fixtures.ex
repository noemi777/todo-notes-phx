defmodule TodoNotes.TodosFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `TodoNotes.Todos` context.
  """

  @doc """
  Generate a note.
  """
  def note_fixture(scope, attrs \\ %{}) do
    attrs =
      Enum.into(attrs, %{
        body: "some body",
        due_date: ~D[2025-06-01],
        tags: ["option1", "option2"],
        title: "some title"
      })

    {:ok, note} = TodoNotes.Todos.create_note(scope, attrs)
    note
  end
end
