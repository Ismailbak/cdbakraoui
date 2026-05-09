"""create dynamic forms tables

Revision ID: a27a4459fec5
Revises: create_rag_tables
Create Date: 2026-05-02 21:21:37.050577

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a27a4459fec5'
down_revision: Union[str, Sequence[str], None] = 'create_rag_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('dynamic_form_templates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('schema_json', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dynamic_form_templates_id'), 'dynamic_form_templates', ['id'], unique=False)
    op.create_index(op.f('ix_dynamic_form_templates_title'), 'dynamic_form_templates', ['title'], unique=True)

    op.create_table('dynamic_form_responses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('act_id', sa.Integer(), nullable=False),
        sa.Column('template_id', sa.Integer(), nullable=False),
        sa.Column('response_data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['act_id'], ['medical_acts.id'], ),
        sa.ForeignKeyConstraint(['template_id'], ['dynamic_form_templates.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dynamic_form_responses_act_id'), 'dynamic_form_responses', ['act_id'], unique=False)
    op.create_index(op.f('ix_dynamic_form_responses_id'), 'dynamic_form_responses', ['id'], unique=False)
    op.create_index(op.f('ix_dynamic_form_responses_template_id'), 'dynamic_form_responses', ['template_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_dynamic_form_responses_template_id'), table_name='dynamic_form_responses')
    op.drop_index(op.f('ix_dynamic_form_responses_id'), table_name='dynamic_form_responses')
    op.drop_index(op.f('ix_dynamic_form_responses_act_id'), table_name='dynamic_form_responses')
    op.drop_table('dynamic_form_responses')
    
    op.drop_index(op.f('ix_dynamic_form_templates_title'), table_name='dynamic_form_templates')
    op.drop_index(op.f('ix_dynamic_form_templates_id'), table_name='dynamic_form_templates')
    op.drop_table('dynamic_form_templates')
