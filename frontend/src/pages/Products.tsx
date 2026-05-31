import React, { useEffect, useState } from 'react';
import { 
  Plus, X, Loader2, PackagePlus, 
  DatabaseZap, RefreshCcw, Package 
} from 'lucide-react';
import { toast } from 'sonner';
import InventoryTable from '../components/InventoryTable';
import { inventoryApi } from '../api/api';
import type { Product, LocationStock } from '../types';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Φόρμα για νέο προϊόν
  const [form, setForm] = useState({ 
    sku: '', 
    name: '', 
    barcode: '', 
    category: 'General' 
  });

  // Κύρια συνάρτηση φόρτωσης και επεξεργασίας δεδομένων
  const loadProducts = async () => {
    setLoading(true);
    try {
      const rawData = await inventoryApi.getProducts();
      
      // ΜΕΤΑΤΡΟΠΗ & GROUPING: Μετατρέπουμε τα Raw Data σε Clean UI Models
      const formattedData = rawData.map((p: any) => {
        const locationMap = new Map<string, LocationStock>();

        // Ομαδοποίηση αποθέματος ανά κωδικό θέσης
        (p.inventory || []).forEach((inv: any) => {
          const code = inv.location?.code || "N/A";
          
          if (locationMap.has(code)) {
            // Αν η θέση υπάρχει ήδη (π.χ. 2 παλέτες στο ίδιο ράφι), τις ενώνουμε
            const existing = locationMap.get(code)!;
            existing.currentStock += inv.quantity;
            // Ενώνουμε και τα movements για πλήρες Audit Trail της θέσης
            existing.movements = [...existing.movements, ...(inv.movements || [])];
          } else {
            // Αν είναι νέα θέση για αυτό το προϊόν
            locationMap.set(code, {
              code: code,
              zone: inv.location?.zone || "Unknown",
              currentStock: inv.quantity,
              movements: inv.movements || []
            });
          }
        });

        const uniqueLocations = Array.from(locationMap.values());
        
        // Υπολογισμός συνολικού αποθέματος
        const totalQty = uniqueLocations.reduce((sum, loc) => sum + loc.currentStock, 0);

        return {
          ...p,
          id: p.id.toString(),
          category: p.category || "General",
          locations: uniqueLocations,
          totalStock: totalQty,
          status: totalQty > 50 ? "In Stock" : totalQty > 0 ? "Low Stock" : "Out of Stock"
        } as Product;
      });

      setProducts(formattedData);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Αποτυχία σύνδεσης με το Backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Λογική για το "Seed All"
  const handleSeedAll = async () => {
    const id = toast.loading("Προετοιμασία αποθήκης...");
    try {
      await inventoryApi.seedProducts();
      await inventoryApi.seedLocations();
      await inventoryApi.seedInventory();
      toast.success("Η αποθήκη γεμίσε επιτυχώς!", { id });
      loadProducts();
    } catch (e) {
      toast.error("Σφάλμα κατά το Seeding", { id });
    }
  };

  // Υποβολή νέου προϊόντος
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.createProduct(form);
      toast.success("Το προϊόν προστέθηκε στον κατάλογο");
      setIsModalOpen(false);
      setForm({ sku: '', name: '', barcode: '', category: 'General' });
      loadProducts();
    } catch (error) {
      toast.error("Αποτυχία καταχώρησης");
    }
  };

  if (loading && products.length === 0) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 flex-col gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Συγχρονισμός Αποθέματος...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
            <Package size={36} className="text-blue-600" />
            Προϊόντα
          </h1>
          <p className="text-slate-500 font-medium">Κεντρικός Κατάλογος & Ιχνηλασιμότητα Αποθέματος</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleSeedAll}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-200"
          >
            <DatabaseZap size={18} /> Seed All
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={18} strokeWidth={3} /> Νέο Είδος
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end px-2">
        <button onClick={loadProducts} className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-xs font-bold uppercase">
          <RefreshCcw size={14} /> Ανανέωση Λίστας
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <InventoryTable products={products} />
      </div>

      {/* MODAL ΔΗΜΙΟΥΡΓΙΑΣ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4 text-blue-600">
                  <PackagePlus size={32} />
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Νέο Προϊόν</h2>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={32} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Περιγραφή</label>
                  <input required className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-700" 
                    placeholder="π.χ. iPhone 15 Pro Max" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">SKU</label>
                    <input required className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-700" 
                      placeholder="SKU-001" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Κατηγορία</label>
                    <input required className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-700" 
                      placeholder="Electronics" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Barcode</label>
                  <input required className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-700" 
                    placeholder="5200..." value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-[0.2em] text-sm active:scale-95">
                Καταχώρηση στη Βάση
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};