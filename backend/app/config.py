from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Set in .env: mysql+pymysql://USER:PASSWORD@localhost:3306/rhumatoai
    # No password: mysql+pymysql://root:@localhost:3306/rhumatoai
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/rhumatoai"
    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"

settings = Settings()
