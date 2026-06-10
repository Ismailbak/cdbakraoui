"""Align rag_chunks columns with ORM model (chunk_metadata, embedding flags).

Revision ID: align_rag_chunks
Revises: a27a4459fec5
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "align_rag_chunks"
down_revision = "a27a4459fec5"
branch_labels = None
depends_on = None


def _column_names(table: str) -> set:
    bind = op.get_bind()
    insp = inspect(bind)
    if table not in insp.get_table_names():
        return set()
    return {c["name"] for c in insp.get_columns(table)}


def upgrade():
    if "rag_chunks" not in inspect(op.get_bind()).get_table_names():
        return

    cols = _column_names("rag_chunks")

    if "chunk_index" not in cols:
        op.add_column(
            "rag_chunks",
            sa.Column("chunk_index", sa.Integer(), nullable=False, server_default="0"),
        )
    if "qdrant_point_id" not in cols:
        op.add_column("rag_chunks", sa.Column("qdrant_point_id", sa.Integer(), nullable=True))
    if "chunk_metadata" not in cols:
        op.add_column("rag_chunks", sa.Column("chunk_metadata", sa.JSON(), nullable=True))
    if "embedding_model" not in cols:
        op.add_column(
            "rag_chunks",
            sa.Column(
                "embedding_model",
                sa.String(length=255),
                nullable=True,
                server_default="sentence-transformers/all-MiniLM-L6-v2",
            ),
        )
    if "is_embedded" not in cols:
        op.add_column(
            "rag_chunks",
            sa.Column("is_embedded", sa.Boolean(), nullable=False, server_default=sa.false()),
        )
    if "embedding_created_at" not in cols:
        op.add_column("rag_chunks", sa.Column("embedding_created_at", sa.DateTime(), nullable=True))
    if "language" not in cols:
        op.add_column(
            "rag_chunks",
            sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        )
    if "created_at" not in cols:
        op.add_column(
            "rag_chunks",
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
    if "updated_at" not in cols:
        op.add_column(
            "rag_chunks",
            sa.Column(
                "updated_at",
                sa.DateTime(),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )


def downgrade():
    pass
