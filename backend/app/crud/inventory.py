from sqlalchemy.orm import Session
from app.models.inventory import Product, Location, Inventory, Movement, Task, Order, OrderItem
from app.schemas.product import ProductCreate
from app import schemas

# Λογική για τα Προϊόντα
def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: ProductCreate):
    db_product = Product(
        sku=product.sku,
        name=product.name,
        barcode=product.barcode
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_locations(db: Session):
    return db.query(Location).all()

def create_location(db: Session, code: str, zone: str):
    db_location = Location(code=code, zone=zone)
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


def seed_locations(db: Session):
    zones = {"A": "Ξηρό Φορτίο", "B": "Ψυχόμενο", "C": "Εύφλεκτα"}
    created = []
    for char, zone_name in zones.items():
        for shelf in range(1, 4):
            code = f"{char}-{shelf:02d}-01"
            # Έλεγχος αν υπάρχει ήδη
            exists = db.query(Location).filter(Location.code == code).first()
            if not exists:
                loc = create_location(db, code, zone_name)
                created.append(loc)
    return created

def seed_products(db: Session):
    sample_products = [
        {"sku": "LAP-DELL-XPS", "name": "Dell XPS 15 Laptop", "category": "Electronics", "barcode": "52001010"},
        {"sku": "MOU-LOGI-MX", "name": "Logitech MX Master 3", "category": "Peripherals", "barcode": "52001011"},
        {"sku": "MON-DELL-27", "name": "Dell 27' 4K Monitor", "category": "Electronics", "barcode": "52001012"},
        {"sku": "KEY-MECH-V3", "name": "Mechanical Keyboard v3", "category": "Peripherals", "barcode": "52001013"},
    ]
    created = []
    for p in sample_products:
        exists = db.query(Product).filter(Product.sku == p["sku"]).first()
        if not exists:
            db_p = Product(**p)
            db.add(db_p)
            created.append(db_p)
    db.commit()
    return created

def seed_inventory(db: Session):
    products = db.query(Product).all()
    locations = db.query(Location).filter(Location.is_active == True).all()
    
    if not products or not locations:
        return {"error": "Missing products or locations"}
        
    for i, p in enumerate(products):
        if i < len(locations):
            loc = locations[i]
            # Δημιουργία αποθέματος
            inv = Inventory(product_id=p.id, location_id=loc.id, quantity=50.0)
            db.add(inv)
            db.flush()
            
            move = Movement(
                inventory_id=inv.id,
                user="System",
                type="IN",
                qty=50.0,
                source_location="Receiving Dock",
                dest_location=loc.code,
                reason="Initial System Seed",
                reference_id="SEED-001"
            )
            db.add(move)
    db.commit()
    return {"status": "Success"}

def record_inventory_transaction(db: Session, sku: str, loc_code: str, qty: float, type: str, user: str, order_id: int = None):
    product = db.query(Product).filter(Product.sku == sku).first()
    location = db.query(Location).filter(Location.code == loc_code).first()
    
    if not product or not location:
        return None

    # 1. Ενημέρωση Αποθέματος
    inv_item = db.query(Inventory).filter(Inventory.product_id == product.id, Inventory.location_id == location.id).first()
    if not inv_item:
        inv_item = Inventory(product_id=product.id, location_id=location.id, quantity=0)
        db.add(inv_item)
        db.flush()

    inv_item.quantity += (qty if type == "IN" else -qty)

    # 2. Καταγραφή Κίνησης (Movements)
    new_move = Movement(
        inventory_id=inv_item.id,
        user=user,
        type=type,
        qty=qty,
        source_location=loc_code if type == "OUT" else "Receiving",
        dest_location="Shipping" if type == "OUT" else loc_code,
        reason=f"PDA Order Execution",
        reference_id=f"ORD-{order_id}" if order_id else "MANUAL"
    )
    db.add(new_move)

    # 3. Ενημέρωση της Παραγγελίας (Order Item)
    if order_id:
        order_item = db.query(OrderItem).filter(OrderItem.order_id == order_id, OrderItem.product_id == product.id).first()
        if order_item:
            order_item.quantity_scanned += qty
            # Έλεγχος αν ολοκληρώθηκε η παραγγελία
            order = db.query(Order).get(order_id)
            all_done = all(item.quantity_scanned >= item.quantity_requested for item in order.items)
            if all_done:
                order.status = "COMPLETED"

    db.commit()
    return inv_item

def create_order(db: Session, order: schemas.OrderCreate):
    # Δημιουργία της κεφαλίδας της παραγγελίας
    db_order = Order(
        order_number=order.order_number,
        type=order.type,
        created_by=order.created_by,
        status="PENDING"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Δημιουργία των γραμμών της παραγγελίας (Items)
    for item in order.items:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity_requested=item.quantity_requested
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders(db: Session):
    return db.query(Order).all()

def update_order_status(db: Session, order_id: int, status: str):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if db_order:
        db_order.status = status
        db.commit()
    return db_order