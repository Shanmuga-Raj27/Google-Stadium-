from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..database import get_db
from ..models import LocationPing, User, StadiumLayout, RoleEnum
from ..schemas import LocationPingCreate, MapConfigSave
from .auth import get_current_user

router = APIRouter(prefix="/map", tags=["Map"])

@router.post("/ping", response_model=dict[str, str | int])
async def ping_location(ping: LocationPingCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ping = LocationPing(zone=ping.zone)
    db.add(db_ping)
    await db.commit()
    
    res = await db.execute(select(func.count(LocationPing.id)).filter(LocationPing.zone == ping.zone))
    count = res.scalar()
    
    status = "crowded" if count > 5 else "normal"
    
    from ..main import manager
    await manager.broadcast({
        "type": "MAP_UPDATE",
        "zone": ping.zone,
        "status": status,
        "count": count
    })
    
    return {"status": "ok", "zone": ping.zone, "density": count}


# --- Sprint 19: Map Config CRUD ---

@router.get("/config", response_model=dict[str, dict])
async def get_map_config(db: AsyncSession = Depends(get_db)):
    """
    Fetch the admin's stadium map config overrides.
    Public read — any authenticated user can view the customized labels/colors.
    """
    result = await db.execute(
        select(StadiumLayout).where(StadiumLayout.name == "map_config")
    )
    layout = result.scalars().first()
    if not layout:
        return {"overrides": {}}
    
    # layout_data stores the overrides dict directly
    return {"overrides": layout.layout_data or {}}


@router.post("/config", response_model=dict[str, str | int])
async def save_map_config(
    payload: MapConfigSave,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save map config overrides. Admin-only endpoint.
    Pydantic validates each override strictly via MapSectionOverride before DB write.
    """
    role_str = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role
    if role_str != "admin":
        raise HTTPException(status_code=403, detail="Only admins can save map configuration")
    
    # Serialize validated overrides to plain dicts for JSON storage
    config_data = {k: v.model_dump(exclude_none=True) for k, v in payload.overrides.items()}
    
    # Upsert: overwrite existing "map_config" row or create new
    result = await db.execute(
        select(StadiumLayout).where(StadiumLayout.name == "map_config")
    )
    existing = result.scalars().first()
    
    if existing:
        existing.layout_data = config_data
    else:
        new_layout = StadiumLayout(name="map_config", layout_data=config_data)
        db.add(new_layout)
    
    await db.commit()
    return {"message": "Map config saved", "sections": len(config_data)}
