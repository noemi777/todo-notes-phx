defmodule TodoNotesWeb.NoteControllerTest do
  use TodoNotesWeb.ConnCase

  import TodoNotes.TodosFixtures

  @create_attrs %{
    title: "some title",
    body: "some body",
    due_date: ~D[2025-06-01],
    tags: ["option1", "option2"]
  }
  @update_attrs %{
    title: "some updated title",
    body: "some updated body",
    due_date: ~D[2025-06-02],
    tags: ["option1"]
  }
  @invalid_attrs %{title: nil, body: nil, due_date: nil, tags: nil}

  setup :register_and_log_in_user

  describe "index" do
    test "lists all notes", %{conn: conn} do
      conn = get(conn, ~p"/notes")
      assert html_response(conn, 200) =~ "Listing Notes"
    end
  end

  describe "new note" do
    test "renders form", %{conn: conn} do
      conn = get(conn, ~p"/notes/new")
      assert html_response(conn, 200) =~ "New Note"
    end
  end

  describe "create note" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/notes", note: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == ~p"/notes/#{id}"

      conn = get(conn, ~p"/notes/#{id}")
      assert html_response(conn, 200) =~ "Note #{id}"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/notes", note: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Note"
    end
  end

  describe "edit note" do
    setup [:create_note]

    test "renders form for editing chosen note", %{conn: conn, note: note} do
      conn = get(conn, ~p"/notes/#{note}/edit")
      assert html_response(conn, 200) =~ "Edit Note"
    end
  end

  describe "update note" do
    setup [:create_note]

    test "redirects when data is valid", %{conn: conn, note: note} do
      conn = put(conn, ~p"/notes/#{note}", note: @update_attrs)
      assert redirected_to(conn) == ~p"/notes/#{note}"

      conn = get(conn, ~p"/notes/#{note}")
      assert html_response(conn, 200) =~ "some updated title"
    end

    test "renders errors when data is invalid", %{conn: conn, note: note} do
      conn = put(conn, ~p"/notes/#{note}", note: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Note"
    end
  end

  describe "delete note" do
    setup [:create_note]

    test "deletes chosen note", %{conn: conn, note: note} do
      conn = delete(conn, ~p"/notes/#{note}")
      assert redirected_to(conn) == ~p"/notes"

      assert_error_sent 404, fn ->
        get(conn, ~p"/notes/#{note}")
      end
    end
  end

  defp create_note(%{scope: scope}) do
    note = note_fixture(scope)

    %{note: note}
  end
end
