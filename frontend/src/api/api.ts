import axios from 'axios';

// Η διεύθυνση του Backend μας
const API_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

export const inventoryApi = {
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  createProduct: async (productData: { sku: string; name: string; barcode: string; category: string }) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  getLocations: async () => {
    const response = await api.get('/locations');
    return response.data;
  },
  seedLocations: async () => {
    const response = await api.post('/locations/seed');
    return response.data;
  },
  seedProducts: async () => {
    const response = await api.post('/products/seed');
    return response.data;
  },
  // frontend/src/api/api.ts
postTransaction: async (data: any) => {
  const response = await api.post('/inventory/transaction', null, { params: data });
  return response.data;
},
seedInventory: async () => {
  const response = await api.post('/inventory/seed'); return response.data; 
},
getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  updateOrderStatus: async (orderId: number, status: string) => {
  const response = await api.post(`/orders/${orderId}/status?status=${status}`);
  return response.data;
  },
  updateLocation: async (id: number, data: { zone: string; warehouse: string; is_active: boolean }) => {
  const response = await api.put(`/locations/${id}`, null, { params: data });
  return response.data;
  },
  
  getAudits: async () => {
    const response = await api.get('/audits');
    return response.data;
  },
  
  postAudit: async (auditData: any) => {
    const response = await api.post('/inventory/audit', null, { params: auditData });
    return response.data;
  }
};