from app.database import engine
from sqlalchemy import text

with engine.connect() as connection:
    print("Altering medical_acts table...")
    try:
        connection.execute(text("ALTER TABLE medical_acts MODIFY COLUMN amount DECIMAL(15,2)"))
        connection.commit()
        print("Successfully updated amount column precision to DECIMAL(15,2)")
    except Exception as e:
        print(f"Error altering table: {e}")
        print("Trying fallback for different DB types...")
        try:
            connection.execute(text("ALTER TABLE medical_acts ALTER COLUMN amount TYPE DECIMAL(15,2)"))
            connection.commit()
            print("Successfully updated amount column precision via ALTER TYPE")
        except Exception as e2:
            print(f"Failed to update column: {e2}")
