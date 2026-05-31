export interface Movement {
  id: number;
  date: string;
  user: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  qty: number;
  source_location: string;
  dest_location: string;
  reason: string;
  taskId?: string;
}

export interface LocationStock {
  code: string;
  zone: string;
  currentStock: number;
  movements: Movement[];
}


export interface RawInventoryItem {
  id: number;
  quantity: number;
  location: {
    code: string;
    zone: string;
  };
  movements: Movement[];
}

export interface Product {
  id: string | number;
  name: string;
  sku: string;
  category: string;
  barcode: string;
  inventory?: RawInventoryItem[]; 
  locations: LocationStock[];  
  totalStock?: number;
  status?: string;
}
export interface AuditRecord {
  id: number;
  location_code: string;
  product_sku: string;
  expected_qty: number;
  counted_qty: number;
  variance: number;
  user: string;
  timestamp: string;
}