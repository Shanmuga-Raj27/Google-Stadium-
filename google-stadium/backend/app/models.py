from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    fan = "fan"
    vendor = "vendor"
    admin = "admin"

class StatusEnum(str, enum.Enum):
    pending = "pending"
    preparing = "preparing"
    ready = "ready"
    delivered = "delivered"

class DeliveryMethodEnum(str, enum.Enum):
    pickup = "pickup"
    seat_delivery = "seat_delivery"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(SAEnum(RoleEnum), default=RoleEnum.fan)

    vendor_profile = relationship("VendorProfile", back_populates="user", uselist=False, lazy="selectin")

class VendorProfile(Base):
    __tablename__ = "vendor_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    store_name = Column(String, index=True)
    stall_id = Column(String, nullable=True) # e.g., 'stall-1' or 'stall-2'
    is_open = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="vendor_profile")
    menu_items = relationship("MenuItem", back_populates="vendor", lazy="selectin")

class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendor_profiles.id"))
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    icon = Column(String)
    
    vendor = relationship("VendorProfile", back_populates="menu_items")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vendor_id = Column(Integer, ForeignKey("users.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=True)
    item = Column(String)
    block = Column(String, nullable=True)
    row = Column(String, nullable=True)
    seat = Column(String, nullable=True)
    status = Column(SAEnum(StatusEnum), default=StatusEnum.pending)
    
    # Sprint 17: Delivery & Financial columns
    delivery_method = Column(SAEnum(DeliveryMethodEnum), default=DeliveryMethodEnum.pickup)
    subtotal = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_price = Column(Float, default=0.0)
    vendor_message = Column(String, nullable=True)
    freebies = Column(JSON, nullable=True)
    
    user = relationship("User", foreign_keys=[user_id])
    vendor_user = relationship("User", foreign_keys=[vendor_id])
    menu_item = relationship("MenuItem")

class StadiumLayout(Base):
    """Stores the admin-configured stadium map as a validated JSON array."""
    __tablename__ = "stadium_layouts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="default")
    layout_data = Column(JSON, nullable=False)

class LocationPing(Base):
    __tablename__ = "location_pings"
    
    id = Column(Integer, primary_key=True, index=True)
    zone = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
