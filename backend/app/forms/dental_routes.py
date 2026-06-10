"""CRUD routes for dental form tables."""

from datetime import datetime
from typing import Any, Dict, Optional, Type

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, create_model
from sqlalchemy.orm import Session

from app.analytics.audit import log_action
from app.auth.router import get_current_user_orm
from app.core.database import get_db
from app.models.dental_forms import DENTAL_FORM_REGISTRY
from app.models.user import User


def _build_create_schema(model_cls: Type, name: str) -> Type[BaseModel]:
    fields: Dict[str, tuple] = {}
    for col in model_cls.__table__.columns:
        if col.name in ("id", "created_at", "updated_at"):
            continue
        fields[col.name] = (Optional[Any], None)
    return create_model(name, **fields, __config__=ConfigDict(from_attributes=True))


def _build_out_schema(model_cls: Type, create_schema: Type[BaseModel]) -> Type[BaseModel]:
    out_fields = {
        "id": (int, ...),
        "created_at": (Optional[datetime], None),
        "updated_at": (Optional[datetime], None),
    }
    for field_name in create_schema.model_fields:
        out_fields[field_name] = (Optional[Any], None)
    return create_model(
        f"{model_cls.__name__}Out",
        **out_fields,
        __config__=ConfigDict(from_attributes=True),
    )


def _sanitize_payload(model_cls: Type, payload: dict) -> dict:
    """Convert empty strings to None so MySQL numeric/tinyint columns accept the data."""
    cleaned = {}
    for key, value in payload.items():
        if value == "":
            cleaned[key] = None
        else:
            cleaned[key] = value
    return cleaned


def _make_handlers(model_cls: Type, table_name: str, create_schema: Type[BaseModel]):
    def create_form(
        data: create_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_orm),
    ):
        payload = _sanitize_payload(model_cls, data.model_dump(exclude_unset=True))
        form = model_cls(**payload)
        db.add(form)
        db.commit()
        db.refresh(form)
        log_action(
            db,
            action="form_created",
            user_id=current_user.id,
            details=f"Created {table_name} #{form.id}",
        )
        return form

    def get_form(form_id: int, db: Session = Depends(get_db)):
        form = db.query(model_cls).filter(model_cls.id == form_id).first()
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        return form

    def update_form(
        form_id: int,
        data: create_schema,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_orm),
    ):
        form = db.query(model_cls).filter(model_cls.id == form_id).first()
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        for key, value in _sanitize_payload(model_cls, data.model_dump(exclude_unset=True)).items():
            setattr(form, key, value)
        db.commit()
        db.refresh(form)
        log_action(
            db,
            action="form_updated",
            user_id=current_user.id,
            details=f"Updated {table_name} #{form.id}",
        )
        return form

    def delete_form(
        form_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user_orm),
    ):
        form = db.query(model_cls).filter(model_cls.id == form_id).first()
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        db.delete(form)
        db.commit()
        log_action(
            db,
            action="form_deleted",
            user_id=current_user.id,
            details=f"Deleted {table_name} #{form_id}",
        )
        return {"message": "Form deleted"}

    return create_form, get_form, update_form, delete_form


def register_dental_routes(router: APIRouter) -> None:
    for route_key, (table_name, model_cls) in DENTAL_FORM_REGISTRY.items():
        create_schema = _build_create_schema(model_cls, f"{model_cls.__name__}Create")
        out_schema = _build_out_schema(model_cls, create_schema)
        create_form, get_form, update_form, delete_form = _make_handlers(
            model_cls, table_name, create_schema
        )

        router.add_api_route(
            f"/{route_key}",
            create_form,
            methods=["POST"],
            response_model=out_schema,
            summary=f"Create {table_name}",
        )
        router.add_api_route(
            f"/{route_key}/{{form_id}}",
            get_form,
            methods=["GET"],
            response_model=out_schema,
            summary=f"Get {table_name}",
        )
        router.add_api_route(
            f"/{route_key}/{{form_id}}",
            update_form,
            methods=["PATCH"],
            response_model=out_schema,
            summary=f"Update {table_name}",
        )
        router.add_api_route(
            f"/{route_key}/{{form_id}}",
            delete_form,
            methods=["DELETE"],
            summary=f"Delete {table_name}",
        )
