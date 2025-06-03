defmodule TodoNotesWeb.PageController do
  use TodoNotesWeb, :controller

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    render(conn, :home, layout: false)
  end

  def greeting(conn, _params) do
    conn
    |> assign(:page_title, "Greeting")
    |> assign_prop(:greeting_text, "world")
    |> render_inertia("Greeting")
  end
end
