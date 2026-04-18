from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import Order, User, MenuItem, StatusEnum, DeliveryMethodEnum
from ..schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from .auth import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/vendor/{vendor_id}/active", response_model=list[OrderResponse])
async def get_vendor_active_orders(
    vendor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all active (non-delivered) orders for a vendor. Fixes state-loss on refresh."""
    result = await db.execute(
        select(Order).where(
            Order.vendor_id == vendor_id,
            Order.status.notin_([StatusEnum.delivered])
        )
    )
    return result.scalars().all()

def calculate_smart_cart(subtotal: float, delivery_method: DeliveryMethodEnum):
    """
    Smart Cart Engine — server-side pricing with tiered promotions.
    Returns (delivery_fee, discount, freebies, total_price).
    """
    # Base delivery fee
    if delivery_method == DeliveryMethodEnum.seat_delivery:
        delivery_fee = 60.0
    else:
        delivery_fee = 0.0

    discount = 0.0
    freebies = []

    # Tiered promotional rules (evaluated top-down, first match wins)
    if subtotal > 500:
        delivery_fee = 0.0
        freebies = ["Water Bottle", "Snacks"]
    elif subtotal > 200:
        if delivery_method == DeliveryMethodEnum.seat_delivery:
            delivery_fee = 30.0
        freebies = ["Water Bottle", "Snacks"]
    elif subtotal > 150:
        freebies = ["Water Bottle", "Snacks"]
    elif subtotal > 100:
        freebies = ["Water Bottle"]

    total_price = subtotal + delivery_fee - discount

    return delivery_fee, discount, freebies, total_price


@router.post("/", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Look up authoritative price from the database — never trust frontend
    subtotal = 0.0
    if order.menu_item_id:
        result = await db.execute(select(MenuItem).where(MenuItem.id == order.menu_item_id))
        menu_item = result.scalars().first()
        if menu_item:
            subtotal = float(menu_item.price)
    
    delivery_fee, discount, freebies, total_price = calculate_smart_cart(subtotal, order.delivery_method)
    
    db_order = Order(
        user_id=order.user_id, 
        vendor_id=order.vendor_id, 
        menu_item_id=order.menu_item_id,
        item=order.item,
        block=order.block,
        row=order.row,
        seat=order.seat,
        delivery_method=order.delivery_method,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        discount=discount,
        total_price=total_price,
        freebies=freebies if freebies else None
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    
    from ..main import manager
    await manager.send_personal_message(
        {
            "type": "NEW_ORDER", 
            "order_id": db_order.id, 
            "item": db_order.item, 
            "status": db_order.status.value,
            "block": db_order.block,
            "row": db_order.row,
            "seat": db_order.seat,
            "user_id": db_order.user_id,
            "delivery_method": db_order.delivery_method.value,
            "subtotal": db_order.subtotal,
            "delivery_fee": db_order.delivery_fee,
            "total_price": db_order.total_price,
            "freebies": db_order.freebies
        }, 
        str(db_order.vendor_id)
    )
    return db_order

@router.put("/{order_id}/{new_status}", response_model=OrderResponse)
async def update_order_status(
    order_id: int, 
    new_status: str, 
    body: OrderStatusUpdate = None,
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    valid_statuses = ["pending", "preparing", "ready", "delivered"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.execute(select(Order).where(Order.id == order_id))
    db_order = result.scalars().first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    db_order.status = StatusEnum(new_status)
    
    # Attach vendor message if provided
    if body and body.vendor_message:
        db_order.vendor_message = body.vendor_message
    
    await db.commit()
    await db.refresh(db_order)
    
    from ..main import manager
    await manager.send_personal_message(
        {
            "type": "ORDER_STATUS_UPDATE", 
            "data": {
                "order_id": db_order.id, 
                "status": new_status, 
                "item": db_order.item,
                "block": db_order.block,
                "row": db_order.row,
                "seat": db_order.seat,
                "vendor_message": db_order.vendor_message,
                "total_price": db_order.total_price,
                "freebies": db_order.freebies
            }
        },
        str(db_order.user_id)
    )
    return db_order
