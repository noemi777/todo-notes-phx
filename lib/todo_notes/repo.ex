defmodule TodoNotes.Repo do
  use Ecto.Repo,
    otp_app: :todo_notes,
    adapter: Ecto.Adapters.Postgres
end
