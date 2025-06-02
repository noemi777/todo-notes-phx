defmodule TodoNotes.TodosTest do
  use TodoNotes.DataCase

  alias TodoNotes.Todos

  describe "notes" do
    alias TodoNotes.Todos.Note

    import TodoNotes.AccountsFixtures, only: [user_scope_fixture: 0]
    import TodoNotes.TodosFixtures

    @invalid_attrs %{title: nil, body: nil, due_date: nil, tags: nil}

    test "list_notes/1 returns all scoped notes" do
      scope = user_scope_fixture()
      other_scope = user_scope_fixture()
      note = note_fixture(scope)
      other_note = note_fixture(other_scope)
      assert Todos.list_notes(scope) == [note]
      assert Todos.list_notes(other_scope) == [other_note]
    end

    test "get_note!/2 returns the note with given id" do
      scope = user_scope_fixture()
      note = note_fixture(scope)
      other_scope = user_scope_fixture()
      assert Todos.get_note!(scope, note.id) == note
      assert_raise Ecto.NoResultsError, fn -> Todos.get_note!(other_scope, note.id) end
    end

    test "create_note/2 with valid data creates a note" do
      valid_attrs = %{
        title: "some title",
        body: "some body",
        due_date: ~D[2025-06-01],
        tags: ["option1", "option2"]
      }

      scope = user_scope_fixture()

      assert {:ok, %Note{} = note} = Todos.create_note(scope, valid_attrs)
      assert note.title == "some title"
      assert note.body == "some body"
      assert note.due_date == ~D[2025-06-01]
      assert note.tags == ["option1", "option2"]
      assert note.user_id == scope.user.id
    end

    test "create_note/2 with invalid data returns error changeset" do
      scope = user_scope_fixture()
      assert {:error, %Ecto.Changeset{}} = Todos.create_note(scope, @invalid_attrs)
    end

    test "update_note/3 with valid data updates the note" do
      scope = user_scope_fixture()
      note = note_fixture(scope)

      update_attrs = %{
        title: "some updated title",
        body: "some updated body",
        due_date: ~D[2025-06-02],
        tags: ["option1"]
      }

      assert {:ok, %Note{} = note} = Todos.update_note(scope, note, update_attrs)
      assert note.title == "some updated title"
      assert note.body == "some updated body"
      assert note.due_date == ~D[2025-06-02]
      assert note.tags == ["option1"]
    end

    test "update_note/3 with invalid scope raises" do
      scope = user_scope_fixture()
      other_scope = user_scope_fixture()
      note = note_fixture(scope)

      assert_raise MatchError, fn ->
        Todos.update_note(other_scope, note, %{})
      end
    end

    test "update_note/3 with invalid data returns error changeset" do
      scope = user_scope_fixture()
      note = note_fixture(scope)
      assert {:error, %Ecto.Changeset{}} = Todos.update_note(scope, note, @invalid_attrs)
      assert note == Todos.get_note!(scope, note.id)
    end

    test "delete_note/2 deletes the note" do
      scope = user_scope_fixture()
      note = note_fixture(scope)
      assert {:ok, %Note{}} = Todos.delete_note(scope, note)
      assert_raise Ecto.NoResultsError, fn -> Todos.get_note!(scope, note.id) end
    end

    test "delete_note/2 with invalid scope raises" do
      scope = user_scope_fixture()
      other_scope = user_scope_fixture()
      note = note_fixture(scope)
      assert_raise MatchError, fn -> Todos.delete_note(other_scope, note) end
    end

    test "change_note/2 returns a note changeset" do
      scope = user_scope_fixture()
      note = note_fixture(scope)
      assert %Ecto.Changeset{} = Todos.change_note(scope, note)
    end
  end
end
