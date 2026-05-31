import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Truck, Plus, Trash2, 
  Save, FileText, Loader2, Package, 
  User, Hash, ArrowRight 
} from 'lucide-react';
import { inventoryApi } from '../api/api';
import { toast } from 'sonner';

// --- Interfaces για την TypeScript ---
interface OrderLine {
  product_id: string;
  name: string;
  qty: number;
}

interface NewOrderState {
  order_number: string;
  type: 'SALE' | 'PURCHASE';
  items: OrderLine[];
}

export const ERP = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State για τη δημιουργία νέας παραγγελίας
  const [newOrder, setNewOrder] = useState<NewOrderState>({
    order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    type: 'SALE',
    items: []
  });

  // State για το τρέχον προϊόν που επιλέγουμε στη φόρμα
  const [currentItem, setCurrentItem] = useState({ product_id: '', qty: 1 });

  const loadData = async () => {
    try {
      const [ordersData, prodsData] = await Promise.all([
        inventoryApi.getOrders(),
        inventoryApi.getProducts()
      ]);
      setOrders(ordersData);
      setProducts(prodsData);
    } catch (e) {
      toast.error("Αποτυχία σύνδεσης με το ERP API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Προσθήκη γραμμής στην παραγγελία
  const addItem = () => {
    if (!currentItem.product_id) {
        toast.error("Παρακαλώ επιλέξτε ένα προϊόν");
        return;
    }

    const prod = products.find((p: any) => p.id === parseInt(currentItem.product_id));
    
    if (prod) {
      const newLine: OrderLine = {
        product_id: currentItem.product_id,
        name: prod.name,
        qty: currentItem.qty
      };

      setNewOrder(prev => ({
        ...prev,
        items: [...prev.items, newLine]
      }));

      // Reset του επιλογέα
      setCurrentItem({ product_id: '', qty: 1 });
    }
  };

  // Αφαίρεση γραμμής
  const removeItem = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Αποθήκευση ολόκληρης της παραγγελίας στη βάση
  const handleSaveOrder = async () => {
    if (newOrder.items.length === 0) {
        toast.error("Η παραγγελία πρέπει να έχει τουλάχιστον ένα προϊόν");
        return;
    }

    try {
      const payload = {
        order_number: newOrder.order_number,
        type: newOrder.type,
        created_by: "Admin ERP User",
        items: newOrder.items.map(i => ({
          product_id: parseInt(i.product_id),
          quantity_requested: i.qty
        }))
      };

      await inventoryApi.createOrder(payload);
      toast.success("Η παραγγελία καταχωρήθηκε και στάλθηκε στο WMS");
      
      // Reset της φόρμας για την επόμενη
      setNewOrder({
        order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'SALE',
        items: []
      });
      
      loadData(); // Ανανέωση της λίστας δεξιά
    } catch (e) {
      toast.error("Σφάλμα κατά την αποθήκευση της παραγγελίας");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Virtual ERP</h1>
          <p className="text-slate-500 font-medium">Εμπορική Διαχείριση & Έκδοση Παραστατικών</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* ΑΡΙΣΤΕΡΗ ΣΤΗΛΗ: ΔΗΜΙΟΥΡΓΙΑ */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShoppingCart size={120} />
          </div>
          
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                <Plus size={24} strokeWidth={3} />
             </div>
             <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Νέο Παραστατικό</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <Hash size={12} /> Αρ. Παραγγελίας
              </label>
              <input readOnly className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-500 outline-none cursor-not-allowed" value={newOrder.order_number} />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <FileText size={12} /> Τύπος Κίνησης
              </label>
              <select 
                className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                value={newOrder.type}
                onChange={(e) => setNewOrder({...newOrder, type: e.target.value as 'SALE' | 'PURCHASE'})}
              >
                <option value="SALE">Πώληση (Sales Order)</option>
                <option value="PURCHASE">Αγορά (Purchase Order)</option>
              </select>
            </div>
          </div>

          {/* Επιλογή Προϊόντων */}
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Προσθήκη Ειδών
            </h3>
            
            <div className="flex gap-3">
              <select 
                className="flex-1 bg-white border-none rounded-xl px-5 py-4 font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={currentItem.product_id}
                onChange={(e) => setCurrentItem({...currentItem, product_id: e.target.value})}
              >
                <option value="">Επιλέξτε Προϊόν...</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
              <input 
                type="number" min="1"
                className="w-24 bg-white border-none rounded-xl px-4 py-4 font-black text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={currentItem.qty} 
                onChange={(e) => setCurrentItem({...currentItem, qty: parseInt(e.target.value) || 1})} 
              />
              <button onClick={addItem} className="bg-slate-900 text-white p-4 rounded-xl hover:bg-black transition-all shadow-lg active:scale-90">
                <Plus strokeWidth={3} />
              </button>
            </div>

            {/* Λίστα προς αποθήκευση */}
            <div className="space-y-3 pt-2">
              {newOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-3 text-slate-700 font-bold">
                     <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">{index + 1}</span>
                     {item.name}
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-blue-600 font-black italic">x{item.qty}</span>
                    <button onClick={() => removeItem(index)} className="text-rose-300 hover:text-rose-600 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {newOrder.items.length === 0 && (
                <p className="text-center text-slate-300 text-sm font-medium py-4">Η λίστα είναι άδεια</p>
              )}
            </div>
          </div>

          <button 
            onClick={handleSaveOrder}
            className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 active:scale-95"
          >
            <Save size={20} strokeWidth={3} /> Οριστικοποίηση & Αποστολή
          </button>
        </div>

        {/* ΔΕΞΙΑ ΣΤΗΛΗ: ΙΣΤΟΡΙΚΟ */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Recent Orders</h2>
              <span className="bg-slate-200 text-slate-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">Total: {orders.length}</span>
           </div>
           
           <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
              {orders.map((order: any) => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-400 hover:shadow-md transition-all cursor-default">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl shadow-inner ${order.type === 'SALE' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {order.type === 'SALE' ? <Truck size={28} /> : <FileText size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 text-lg">{order.order_number}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-black ${order.status === 'PENDING' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        <User size={10} /> {order.created_by} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black italic tracking-widest ${order.type === 'SALE' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {order.type === 'SALE' ? 'SALES' : 'PURCHASE'}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                      {order.items.length} items <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-20 text-slate-300 font-bold uppercase tracking-widest border-4 border-dashed border-slate-200 rounded-[3rem]">
                  No orders found
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};