import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Plus, Minus, CheckCircle2, Barcode,
  Package, Download, Search, ClipboardList, Battery, Wifi, AlertTriangle,
  X, ScanLine, ShoppingCart, ArrowRight 
} from 'lucide-react';
import { inventoryApi } from '../api/api';
import { toast } from 'sonner';

type PdaScreen = 'HOME' | 'ORDERS' | 'PICKING_LIST' | 'PICKING_DETAIL' | 'PUTAWAY' | 'LOOKUP' | 'COUNT';

interface PdaProps {
  onRefresh: () => void;
}

const PickingListPDA = ({ onRefresh }: PdaProps) => {
  const [activeScreen, setActiveScreen] = useState<PdaScreen>('HOME');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'SALE' | 'PURCHASE'>('SALE');

 
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState<any[] | null>(null);
  const [countData, setCountData] = useState({ loc: '', sku: '', qty: 0 });

  const [time, setTime] = useState('');

  const loadOrders = async () => {
    const data = await inventoryApi.getOrders();
    setAllOrders(data);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })), 1000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---

  const handleStartProcess = (type: 'SALE' | 'PURCHASE') => {
    setOrderType(type);
    loadOrders();
    setActiveScreen('ORDERS');
  };

  const handleSelectOrder = async (order: any) => {
    await inventoryApi.updateOrderStatus(order.id, 'IN_PROGRESS');
    setSelectedOrder(order);
    setActiveScreen('PICKING_LIST');
    onRefresh();
  };

  const handlePickTransaction = async (sku: string, qty: number, loc: string) => {
    try {
      const transType = orderType === 'SALE' ? 'OUT' : 'IN';
      await inventoryApi.postTransaction({
        sku, loc_code: loc, qty, type: transType, user: 'PDA_USER', order_id: selectedOrder.id
      });
      const updated = await inventoryApi.getOrders();
      setSelectedOrder(updated.find((o: any) => o.id === selectedOrder.id));
      onRefresh();
      toast.success("Ενημερώθηκε!");
    } catch (e) { toast.error("Σφάλμα API"); }
  };

  const handleLookup = async () => {
    const products = await inventoryApi.getProducts();
    const results = products.flatMap((p: any) => 
      p.inventory.filter((inv: any) => inv.location.code.toUpperCase() === lookupQuery.toUpperCase())
      .map((inv: any) => ({ name: p.name, sku: p.sku, qty: inv.quantity }))
    );
    setLookupResults(results);
  };

  const handleCountSubmit = async () => {
    // Εδώ θα έμπαινε η λογική ADJUSTMENT. Για το demo κάνουμε ένα απλό toast.
    toast.success(`Η απογραφή για τη θέση ${countData.loc} καταχωρήθηκε.`);
    setActiveScreen('HOME');
  };

  const pickingItems = selectedOrder ? selectedOrder.items.map((i: any) => ({
    id: i.id.toString(),
    name: i.product.name,
    sku: i.product.sku,
    requiredQty: i.quantity_requested,
    pickedQty: i.quantity_scanned,
    location: i.product.inventory[0]?.location.code || "N/A"
  })) : [];

  return (
    <div className="relative h-full w-full bg-slate-950 text-white overflow-hidden flex flex-col font-sans select-none">
      {/* Status Bar */}
      <div className="bg-slate-900 px-4 py-1.5 flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-800">
        <div className="flex items-center gap-2"><span>{time}</span><Wifi size={10} className="text-emerald-500" /></div>
        <div className="flex items-center gap-1"><Battery size={12} className="text-emerald-500" /><span>95%</span></div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* MENU */}
        {activeScreen === 'HOME' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 justify-between">
            <div className="text-center mt-4">
              <span className="text-[10px] uppercase font-black text-blue-500 tracking-[0.2em]">University WMS</span>
              <h1 className="text-2xl font-black tracking-tight mt-1 text-slate-100">WMS OPERATOR</h1>
            </div>
            <div className="grid grid-cols-2 gap-4 my-auto">
              <button onClick={() => handleStartProcess('SALE')} className="h-32 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><ShoppingCart size={24} /></div>
                <span className="text-xs font-bold uppercase">Picking</span>
              </button>
              <button onClick={() => handleStartProcess('PURCHASE')} className="h-32 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Download size={24} /></div>
                <span className="text-xs font-bold uppercase">Putaway</span>
              </button>
              <button onClick={() => setActiveScreen('LOOKUP')} className="h-32 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><Search size={24} /></div>
                <span className="text-xs font-bold uppercase">Lookup</span>
              </button>
              <button onClick={() => setActiveScreen('COUNT')} className="h-32 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><ClipboardList size={24} /></div>
                <span className="text-xs font-bold uppercase">Count</span>
              </button>
            </div>
            <button className="w-full py-4 bg-amber-400 text-slate-950 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest">
                <ScanLine size={18} strokeWidth={3} /> SCAN BARCODE
            </button>
          </motion.div>
        )}

        {/* ORDERS */}
        {activeScreen === 'ORDERS' && (
          <motion.div key="orders" initial={{ x: 100 }} animate={{ x: 0 }} className="flex-1 flex flex-col bg-slate-900 p-4">
             <button onClick={() => setActiveScreen('HOME')} className="text-slate-500 mb-6 flex items-center gap-1 font-bold text-xs uppercase"><ChevronLeft size={16}/> Back</button>
             <h2 className="text-white font-black text-xl mb-6 px-2 italic uppercase">Select {orderType === 'SALE' ? 'Picking' : 'Putaway'}</h2>
             <div className="space-y-3 overflow-y-auto pr-1">
                {allOrders.filter(o => o.type === orderType && o.status !== 'COMPLETED').map(order => (
                    <button key={order.id} onClick={() => handleSelectOrder(order)} className="w-full bg-slate-850 p-5 rounded-3xl border border-slate-800 flex justify-between items-center active:scale-95 transition-all group">
                        <div className="text-left">
                            <p className="text-blue-400 font-black text-sm">{order.order_number}</p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase">{order.items.length} Items • {order.status}</p>
                        </div>
                        <ArrowRight className="text-slate-700 group-hover:text-blue-500" size={20} />
                    </button>
                ))}
             </div>
          </motion.div>
        )}

        {/* LIST & DETAIL (Picking/Putaway Execution) */}
        {activeScreen === 'PICKING_LIST' && (
           <motion.div key="list" initial={{ x: 100 }} animate={{ x: 0 }} className="flex-1 flex flex-col h-full bg-slate-950">
             <div className="p-4 flex items-center justify-between bg-blue-600 shadow-xl z-20">
                <button onClick={() => setActiveScreen('ORDERS')} className="text-white hover:bg-blue-700 p-1 rounded-lg"><ChevronLeft size={24} /></button>
                <span className="text-white font-black text-xs uppercase italic">{selectedOrder?.order_number}</span>
                <button onClick={() => setActiveScreen('HOME')} className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Finish</button>
             </div>
             <div className="overflow-y-auto p-4 space-y-3 flex-1">
                {pickingItems.map((item: any) => (
                  <div key={item.id} onClick={() => { setSelectedProductId(item.id); setActiveScreen('PICKING_DETAIL'); }}
                    className={`p-4 rounded-2xl border transition-all active:scale-95 cursor-pointer ${item.pickedQty >= item.requiredQty ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex justify-between items-center">
                      <div><span className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2">{item.location}</span><h3 className="font-bold text-slate-100 mt-1">{item.name}</h3><p className="text-xs text-slate-500 font-mono">{item.sku}</p></div>
                      <div className="text-right"><div className="text-xl font-black">{item.pickedQty}/{item.requiredQty}</div><span className="text-[10px] text-slate-500 font-bold uppercase">Work</span></div>
                    </div>
                  </div>
                ))}
             </div>
           </motion.div>
        )}

        {activeScreen === 'PICKING_DETAIL' && (
          <motion.div key="detail" className="flex-1 flex flex-col bg-slate-900 p-6">
             <button onClick={() => setActiveScreen('PICKING_LIST')} className="mb-6"><ChevronLeft/></button>
             <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-10 bg-blue-600/10 border-4 border-blue-600 rounded-[3rem]">
                   <MapPin size={48} className="text-blue-600 mx-auto mb-2"/>
                   <span className="text-4xl font-black">{pickingItems.find((p: any) => p.id === selectedProductId)?.location}</span>
                </div>
                <h2 className="text-2xl font-black italic">{pickingItems.find((p: any) => p.id === selectedProductId)?.name}</h2>
                <button onClick={() => { handlePickTransaction(pickingItems.find((p: any) => p.id === selectedProductId)!.sku, 1, pickingItems.find((p: any) => p.id === selectedProductId)!.location); setActiveScreen('PICKING_LIST'); }} className="w-full py-6 bg-blue-600 rounded-3xl font-black uppercase text-xl shadow-xl">Confirm Pick/Put</button>
             </div>
          </motion.div>
        )}

        {/* LOOKUP SCREEN */}
        {activeScreen === 'LOOKUP' && (
          <motion.div key="lookup" initial={{ x: 100 }} animate={{ x: 0 }} className="flex-1 flex flex-col bg-slate-900 p-6">
            <button onClick={() => setActiveScreen('HOME')} className="mb-6"><ChevronLeft/></button>
            <h2 className="text-xl font-black mb-4 uppercase italic">Stock Lookup</h2>
            <div className="flex gap-2 mb-6">
               <input value={lookupQuery} onChange={e => setLookupQuery(e.target.value)} placeholder="Enter Location..." className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 font-bold uppercase" />
               <button onClick={handleLookup} className="bg-blue-600 p-3 rounded-xl"><Search/></button>
            </div>
            <div className="space-y-3">
               {lookupResults?.map((r, i) => (
                 <div key={i} className="bg-slate-800 p-4 rounded-2xl flex justify-between items-center border-l-4 border-blue-500">
                    <div><p className="font-bold text-sm">{r.name}</p><p className="text-[10px] text-slate-500">{r.sku}</p></div>
                    <span className="text-xl font-black text-blue-400">x{r.qty}</span>
                 </div>
               ))}
               {lookupResults?.length === 0 && <p className="text-center text-slate-500">Η θέση είναι άδεια.</p>}
            </div>
          </motion.div>
        )}

        {/* COUNT SCREEN */}
        {activeScreen === 'COUNT' && (
          <motion.div key="count" initial={{ x: 100 }} animate={{ x: 0 }} className="flex-1 flex flex-col bg-slate-900 p-6">
            <button onClick={() => setActiveScreen('HOME')} className="mb-6"><ChevronLeft/></button>
            <h2 className="text-xl font-black mb-6 uppercase italic">Inventory Count</h2>
            <div className="space-y-6">
               <input placeholder="Location Code" className="w-full bg-slate-800 rounded-xl px-4 py-4 font-bold uppercase" />
               <input placeholder="Product Barcode" className="w-full bg-slate-800 rounded-xl px-4 py-4 font-bold uppercase" />
               <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
                  <button onClick={() => setCountData(d => ({...d, qty: d.qty-1}))} className="p-4 bg-slate-800 rounded-xl"><Minus/></button>
                  <span className="text-4xl font-black">{countData.qty}</span>
                  <button onClick={() => setCountData(d => ({...d, qty: d.qty+1}))} className="p-4 bg-blue-600 rounded-xl"><Plus/></button>
               </div>
               <button onClick={handleCountSubmit} className="w-full py-5 bg-purple-600 rounded-2xl font-black uppercase shadow-lg">Submit Adjustment</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default PickingListPDA;