from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import User, VendorProfile, MenuItem, Order, RoleEnum, StatusEnum
from ..schemas import MenuItemCreate, MenuItemResponse, UserResponse, VendorWalletResponse, WalletOrderItem
from .auth import get_current_user

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.get("/", response_model=List[UserResponse])
async def get_active_vendors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .where(User.role == RoleEnum.vendor)
        .options(selectinload(User.vendor_profile).selectinload(VendorProfile.menu_items))
    )
    return result.scalars().all()

@router.post("/menu", response_model=MenuItemResponse)
async def create_menu_item(item: MenuItemCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.vendor or not current_user.vendor_profile:
        raise HTTPException(status_code=403, detail="Only vendors can create menu items")
        
    db_item = MenuItem(
        vendor_id=current_user.vendor_profile.id,
        name=item.name,
        description=item.description,
        price=item.price,
        icon=item.icon
    )
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Admin restricted")
        
    result = await db.execute(select(User).options(selectinload(User.vendor_profile).selectinload(VendorProfile.menu_items)))
    return result.scalars().all()

@router.get("/{vendor_id}/wallet", response_model=VendorWalletResponse)
async def get_vendor_wallet(vendor_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Aggregate financial data for a vendor: total sales, order counts, and order history."""
    # Fetch all orders for this vendor
    result = await db.execute(
        select(Order).where(Order.vendor_id == vendor_id)
    )
    all_orders = result.scalars().all()
    
    delivered_orders = [o for o in all_orders if o.status == StatusEnum.delivered]
    pending_orders = [o for o in all_orders if o.status in (StatusEnum.pending, StatusEnum.preparing)]
    
    total_sales = sum(o.total_price for o in delivered_orders)
    
    order_history = [
        WalletOrderItem(
            id=o.id,
            item=o.item,
            total_price=o.total_price,
            status=o.status,
            block=o.block,
            row=o.row,
            seat=o.seat
        )
        for o in all_orders
    ]
    
    return VendorWalletResponse(
        total_sales=round(total_sales, 2),
        total_orders=len(all_orders),
        pending_orders=len(pending_orders),
        completed_orders=len(delivered_orders),
        order_history=order_history
    )
