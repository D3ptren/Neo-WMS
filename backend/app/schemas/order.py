from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .product import Product

class OrderItemBase(BaseModel):
    product_id: int
    quantity_requested: float

class OrderItem(OrderItemBase):
    id: int
    quantity_scanned: float
    product: Optional[Product] = None
    class Config: from_attributes = True

class OrderCreate(BaseModel):
    order_number: str
    type: str # SALE / PURCHASE
    created_by: str
    items: List[OrderItemBase]

class Order(BaseModel):
    id: int
    order_number: str
    type: str
    status: str
    created_at: datetime
    items: List[OrderItem]
    class Config: from_attributes = True