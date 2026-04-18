from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict
from datetime import datetime
from .models import RoleEnum, StatusEnum, DeliveryMethodEnum

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    icon: str

class MenuItemResponse(MenuItemCreate):
    id: int
    vendor_id: int
    
    class Config:
        from_attributes = True

class VendorProfileCreate(BaseModel):
    store_name: str
    is_open: bool = False
    stall_id: Optional[str] = None

class VendorProfileResponse(VendorProfileCreate):
    id: int
    user_id: int
    menu_items: List[MenuItemResponse] = []
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: RoleEnum = RoleEnum.fan
    
    store_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: RoleEnum
    vendor_profile: Optional[VendorProfileResponse] = None
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    user_id: int
    vendor_id: int
    menu_item_id: Optional[int] = None
    item: str
    block: str = ""
    row: str = ""
    seat: str = ""
    delivery_method: DeliveryMethodEnum = DeliveryMethodEnum.pickup

class OrderResponse(BaseModel):
    id: int
    user_id: int
    vendor_id: int
    menu_item_id: Optional[int] = None
    item: str
    block: Optional[str] = None
    row: Optional[str] = None
    seat: Optional[str] = None
    status: StatusEnum
    delivery_method: DeliveryMethodEnum = DeliveryMethodEnum.pickup
    subtotal: float = 0.0
    delivery_fee: float = 0.0
    discount: float = 0.0
    total_price: float = 0.0
    vendor_message: Optional[str] = None
    freebies: Optional[List[str]] = None
    
    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    vendor_message: Optional[str] = None

class LocationPingCreate(BaseModel):
    zone: str

# Sprint 17: Wallet response schemas
class WalletOrderItem(BaseModel):
    id: int
    item: str
    total_price: float
    status: StatusEnum
    block: Optional[str] = None
    row: Optional[str] = None
    seat: Optional[str] = None
    
    class Config:
        from_attributes = True

class VendorWalletResponse(BaseModel):
    total_sales: float
    total_orders: int
    pending_orders: int
    completed_orders: int
    order_history: List[WalletOrderItem] = []


# --- Sprint 19: Map Config Schemas ---

class MapSectionOverride(BaseModel):
    """Single section override — admin can rename/recolor a section."""
    label: Optional[str] = None
    color: Optional[str] = None

    @field_validator("color")
    @classmethod
    def validate_color(cls, v):
        """Only allow valid hex colors or named colors to prevent injection."""
        if v is None:
            return v
        import re
        # Accept hex (#RGB, #RRGGBB) or simple CSS color names (letters only)
        if re.match(r'^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', v) or re.match(r'^[a-zA-Z]{2,20}$', v):
            return v
        raise ValueError(f"Invalid color value: {v}")


class MapConfigSave(BaseModel):
    """
    Payload for saving map configuration overrides.
    Keys are section IDs (e.g., 'block-A', 'gate-1'), values are overrides.
    """
    overrides: Dict[str, MapSectionOverride]

    @field_validator("overrides")
    @classmethod
    def validate_keys(cls, v):
        """Ensure section IDs follow a safe pattern to prevent injection."""
        import re
        for key in v.keys():
            if not re.match(r'^[a-zA-Z0-9\-_]{1,30}$', key):
                raise ValueError(f"Invalid section ID: {key}")
        return v


class MapConfigResponse(BaseModel):
    overrides: Dict[str, MapSectionOverride] = {}
