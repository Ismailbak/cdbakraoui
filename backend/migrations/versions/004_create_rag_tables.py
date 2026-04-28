"""Create RAG chunk tables for semantic retrieval and caching.

Revision ID: create_rag_tables
Revises: previous_migration_id
Create Date: 2026-04-28 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'create_rag_tables'
down_revision = 'add_chat_sessions_table'
branch_labels = None
depends_on = None


def upgrade():
    """Create RAG chunk and query cache tables."""
    
    # Table: rag_chunks
    op.create_table(
        'rag_chunks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=True),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('source_id', sa.Integer(), nullable=False),
        sa.Column('chunk_text', sa.Text(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('qdrant_point_id', sa.Integer(), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('embedding_model', sa.String(length=255), nullable=True, 
                  server_default='sentence-transformers/all-MiniLM-L6-v2'),
        sa.Column('is_embedded', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('embedding_created_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, 
                  server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('qdrant_point_id'),
        mysql_charset='utf8mb4',
        mysql_collate='utf8mb4_unicode_ci'
    )
    
    # Indexes for rag_chunks
    op.create_index('ix_rag_chunks_patient_id', 'rag_chunks', ['patient_id'])
    op.create_index('ix_rag_chunks_source_type', 'rag_chunks', ['source_type'])
    op.create_index('ix_rag_chunks_created_at', 'rag_chunks', ['created_at'])
    op.create_index('ix_rag_chunks_source_lookup', 'rag_chunks', 
                    ['source_type', 'source_id'])
    op.create_index('ix_rag_chunks_is_embedded', 'rag_chunks', ['is_embedded'])
    
    # Table: rag_query_cache
    op.create_table(
        'rag_query_cache',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('query_hash', sa.String(length=64), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('retrieval_payload', sa.JSON(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('hit_count', sa.Integer(), nullable=False, server_default='0'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('query_hash'),
        mysql_charset='utf8mb4'
    )
    
    # Indexes for rag_query_cache
    op.create_index('ix_rag_query_cache_hash', 'rag_query_cache', ['query_hash'])
    op.create_index('ix_rag_query_cache_expires', 'rag_query_cache', ['expires_at'])


def downgrade():
    """Drop RAG chunk and query cache tables."""
    op.drop_index('ix_rag_query_cache_expires', 'rag_query_cache')
    op.drop_index('ix_rag_query_cache_hash', 'rag_query_cache')
    op.drop_table('rag_query_cache')
    
    op.drop_index('ix_rag_chunks_is_embedded', 'rag_chunks')
    op.drop_index('ix_rag_chunks_source_lookup', 'rag_chunks')
    op.drop_index('ix_rag_chunks_created_at', 'rag_chunks')
    op.drop_index('ix_rag_chunks_source_type', 'rag_chunks')
    op.drop_index('ix_rag_chunks_patient_id', 'rag_chunks')
    op.drop_table('rag_chunks')
