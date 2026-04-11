from fastapi import APIRouter, HTTPException
from app.schemas.game_register_schema import GameRegisterForm
from app.services.spreadsheet_service import append_to_sheet

router = APIRouter(prefix="/api", tags=["Game Register"])

@router.post("/game-register")
async def game_register(form: GameRegisterForm):
    success = await append_to_sheet(form.name, form.number)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save data to spreadsheet")
    return {"status": "success", "message": "Registration successful"}
