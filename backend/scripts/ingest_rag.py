"""
Ingest patient records into rag_chunks + Qdrant.

Usage (from backend/):
  python -m scripts.ingest_rag --patient-id 1
  python -m scripts.ingest_rag --all
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal
from app.models.patient import Patient
from app.chat.rag.ingestion import ingest_patient_records


def main():
    parser = argparse.ArgumentParser(description="Ingest RAG chunks for patients")
    parser.add_argument("--patient-id", type=int, help="Single patient ID")
    parser.add_argument("--all", action="store_true", help="All patients")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.patient_id:
            n = ingest_patient_records(db, args.patient_id)
            print(f"Ingested {n} chunks for patient {args.patient_id}")
        elif args.all:
            for p in db.query(Patient).all():
                n = ingest_patient_records(db, p.id)
                print(f"Patient {p.id}: {n} chunks")
        else:
            parser.print_help()
            sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
