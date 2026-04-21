"""Add chat_sessions table

Revision ID: add_chat_sessions_table
Revises: b5add256af78
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_chat_sessions_table'
down_revision = 'b5add256af78'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create chat_sessions table
    op.create_table(
        'chat_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_chat_sessions_patient_id'), 'chat_sessions', ['patient_id'])
    op.create_index(op.f('ix_chat_sessions_created_by'), 'chat_sessions', ['created_by'])
    
    # Update chat_messages table to add session_id and related foreign key
    # First, add the column nullable
    op.add_column('chat_messages', sa.Column('session_id', sa.Integer(), nullable=True))
    
    # Create foreign key constraint
    op.create_foreign_key(
        'fk_chat_messages_session_id',
        'chat_messages',
        'chat_sessions',
        ['session_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # Create index on session_id
    op.create_index(op.f('ix_chat_messages_session_id'), 'chat_messages', ['session_id'])


def downgrade() -> None:
    # Drop chat_messages foreign key and column
    op.drop_index(op.f('ix_chat_messages_session_id'), table_name='chat_messages')
    op.drop_constraint('fk_chat_messages_session_id', 'chat_messages', type_='foreignkey')
    op.drop_column('chat_messages', 'session_id')
    
    # Drop chat_sessions table and indexes
    op.drop_index(op.f('ix_chat_sessions_created_by'), table_name='chat_sessions')
    op.drop_index(op.f('ix_chat_sessions_patient_id'), table_name='chat_sessions')
    op.drop_table('chat_sessions')
