from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base
import datetime

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)
    category = Column(String, default="General")
    barcode = Column(String, unique=True, index=True)
    
    inventory = relationship("Inventory", back_populates="product")

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    zone = Column(String)
    warehouse = Column(String, default="Main Warehouse")
    is_active = Column(Boolean, default=True)
    
    inventory = relationship("Inventory", back_populates="location")

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    location_id = Column(Integer, ForeignKey("locations.id"))
    quantity = Column(Float, default=0.0)
    
    product = relationship("Product", back_populates="inventory")
    location = relationship("Location", back_populates="inventory")
    # Σύνδεση με τις κινήσεις που αφορούν αυτό το συγκεκριμένο απόθεμα
    movements = relationship("Movement", back_populates="inventory_item")

class Movement(Base):
    __tablename__ = "movements"
    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    user = Column(String)
    type = Column(String) # IN, OUT, TRANSFER, ADJUSTMENT
    qty = Column(Float)
    
    # Ιχνηλασιμότητα
    source_location = Column(String) # Από ποια θέση (π.χ. "A-01-01" ή "Receiving")
    dest_location = Column(String)   # Σε ποια θέση (π.χ. "B-02-01" ή "Shipping")
    reason = Column(String)          # Λόγος: "Order Picking", "Relocation", "Inventory correction"
    reference_id = Column(String)    # Το ID της παραγγελίας (π.χ. SO-001) ή της απογραφής

    inventory_item = relationship("Inventory", back_populates="movements")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # PICKING, PUTAWAY, COUNT
    status = Column(String, default="PENDING") # PENDING, COMPLETED, PENDING_APPROVAL
    worker_name = Column(String)
    product_sku = Column(String)
    qty = Column(Float)
    location_code = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True)
    type = Column(String) # SALE (Sales Order) ή PURCHASE (Purchase Order)
    status = Column(String, default="PENDING") # PENDING, IN_PROGRESS, COMPLETED, PENDING_APPROVAL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_by = Column(String)
    
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity_requested = Column(Float)
    quantity_scanned = Column(Float, default=0.0)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class Audit(Base):
    __tablename__ = "audits"
    id = Column(Integer, primary_key=True, index=True)
    location_code = Column(String)
    product_sku = Column(String)
    expected_qty = Column(Float) 
    counted_qty = Column(Float)  
    variance = Column(Float)     
    user = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)