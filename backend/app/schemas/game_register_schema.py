from pydantic import BaseModel, Field

class GameRegisterForm(BaseModel):
    name: str = Field(..., example="Aadithyan")
    number: str = Field(..., example="9876543210")
