defmodule TodoNotes.Todos.Note do
  use Ecto.Schema
  import Ecto.Changeset
  
  @derive {Jason.Encoder, only: [:id, :title, :body, :due_date, :tags, :inserted_at, :updated_at]}

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "notes" do
    field :title, :string
    field :body, :string
    field :due_date, :date
    field :tags, {:array, :string}
    # field :user_id, :binary_id

    belongs_to :user, TodoNotes.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(note, attrs, user_scope) do
    note
    |> cast(attrs, [:title, :body, :due_date, :tags])
    |> validate_required([:title, :body])
    |> put_change(:user_id, user_scope.user.id)
  end
end
