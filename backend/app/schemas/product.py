from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# 1. Σχήμα για τις κινήσεις (Movements)
class MovementSchema(BaseModel):
    id: int
    date: datetime
    user: str
    type: str
    qty: float
    source_location: str
    dest_location: str
    reason: str
    taskId: Optional[str] = None

    class Config:
        from_attributes = True

# 2. Σχήμα για την Τοποθεσία (Location)
class LocationSchema(BaseModel):
    id: int
    code: str
    zone: str

    class Config:
        from_attributes = True

# 3. Σχήμα για το Απόθεμα (Inventory)
# Αυτό συνδέει την ποσότητα με την Τοποθεσία και τις Κινήσεις της
class InventorySchema(BaseModel):
    id: int
    quantity: float
    location: LocationSchema  
    movements: List[MovementSchema]

    class Config:
        from_attributes = True

# 4. Βασικά σχήματα Προϊόντος
class ProductBase(BaseModel):
    sku: str
    name: str
    category: str
    barcode: str

class ProductCreate(ProductBase):
    pass

# 5. Το τελικό σχήμα Προϊόντος που στέλνουμε στη React
class Product(ProductBase):
    id: int
    inventory: List[InventorySchema] = []

    class Config:
        from_attributes = True
class AuditSchema(BaseModel):
    id: int
    location_code: str
    product_sku: str
    expected_qty: float
    counted_qty: float
    variance: float
    user: str
    timestamp: datetime
    class Config:
        from_attributes = True