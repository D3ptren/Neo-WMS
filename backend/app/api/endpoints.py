from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app import schemas, crud

router = APIRouter()

@router.get("/products", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

@router.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@router.get("/locations")
def read_locations(db: Session = Depends(get_db)):
    return crud.get_locations(db)

@router.post("/locations/seed")
def seed_warehouse(db: Session = Depends(get_db)):
    return crud.seed_locations(db)

@router.post("/products/seed")
def seed_products_api(db: Session = Depends(get_db)):
    try:
        return crud.seed_products(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inventory/transaction")
def complete_transaction(
    sku: str, loc_code: str, qty: float, type: str, user: str, 
    db: Session = Depends(get_db)
):
    result = crud.record_inventory_transaction(db, sku, loc_code, qty, type, user)
    if not result:
        raise HTTPException(status_code=404, detail="Product or Location not found")
    return {"status": "success", "new_quantity": result.quantity}

@router.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()


@router.post("/orders", response_model=schemas.Order)
def create_new_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    return crud.create_order(db=db, order=order)

@router.get("/orders", response_model=List[schemas.Order])
def read_orders(db: Session = Depends(get_db)):
    try:
        orders = crud.get_orders(db)
        return orders
    except Exception as e:
        print(f"ERROR IN GET ORDERS: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Πρόσθεσε και αυτό για να ελέγχεις το inventory seed
@router.post("/inventory/seed")
def seed_inventory_endpoint(db: Session = Depends(get_db)):
    return crud.seed_inventory(db)

@router.post("/orders/{order_id}/status")
def change_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    return crud.update_order_status(db, order_id, status)

@router.put("/locations/{location_id}")
def update_location(location_id: int, zone: str, warehouse: str, is_active: bool, db: Session = Depends(get_db)):
    db_location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    db_location.zone = zone
    db_location.warehouse = warehouse
    db_location.is_active = is_active
    
    db.commit()
    return db_location

@router.post("/inventory/audit")
def record_audit(location_code: str, product_sku: str, counted_qty: float, user: str, db: Session = Depends(get_db)):
    # 1. Βρες το τρέχον απόθεμα
    product = db.query(models.Product).filter(models.Product.sku == product_sku).first()
    location = db.query(models.Location).filter(models.Location.code == location_code).first()
    
    inv_item = db.query(models.Inventory).filter(
        models.Inventory.product_id == product.id, 
        models.Inventory.location_id == location.id
    ).first()
    
    expected = inv_item.quantity if inv_item else 0
    variance = counted_qty - expected

    
    new_audit = models.Audit(
        location_code=location_code,
        product_sku=product_sku,
        expected_qty=expected,
        counted_qty=counted_qty,
        variance=variance,
        user=user
    )
    db.add(new_audit)

    
    if not inv_item:
        inv_item = models.Inventory(product_id=product.id, location_id=location.id, quantity=counted_qty)
        db.add(inv_item)
    else:
        inv_item.quantity = counted_qty

    
    move = models.Movement(
        inventory_id=inv_item.id,
        user=user,
        type="ADJUSTMENT",
        qty=abs(variance),
        source_location=location_code,
        dest_location=location_code,
        reason=f"Inventory Audit (Var: {variance})",
        reference_id=f"AUDIT-{new_audit.id}"
    )
    db.add(move)
    
    db.commit()
    return {"status": "success", "variance": variance}

@router.get("/audits")
def get_audits(db: Session = Depends(get_db)):
    return db.query(models.Audit).order_by(models.Audit.timestamp.desc()).all()

@router.get("/audits", response_model=List[schemas.AuditSchema])
def read_audits(db: Session = Depends(get_db)):
    return db.query(models.Audit).order_by(models.Audit.timestamp.desc()).all()