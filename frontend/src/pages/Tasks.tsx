import React, { useState, useEffect } from 'react';
import PickingListPDA from '../components/PickingList';
import { inventoryApi } from '../api/api';
import { ClipboardList, Smartphone, ShieldAlert, Clock, CheckCircle2, DatabaseZap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'simulator'>('monitoring');
  const [allOrders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const orders = await inventoryApi.getOrders();
      setOrders(orders);
    } catch (e) {
      toast.error("Σφάλμα συγχρονισμού");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAdminApprove = async (orderId: number) => {
    if (window.confirm("Εγκρίνετε την παραγγελία με τις αποκλίσεις;")) {
      await inventoryApi.updateOrderStatus(orderId, 'COMPLETED');
      loadData();
    }
  };

  const activeTasksForAdmin = allOrders.filter(o => o.status !== 'PENDING');

  if (loading && allOrders.length === 0) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 uppercase italic">Control Room</h1>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('monitoring')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'monitoring' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>MONITORING</button>
          <button onClick={() => setActiveTab('simulator')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'simulator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>PDA TERMINAL</button>
        </div>
      </div>

      {activeTab === 'monitoring' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {activeTasksForAdmin.map(task => (
              <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-2xl ${task.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : task.status === 'PENDING_APPROVAL' ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
                      {task.status === 'PENDING_APPROVAL' ? <ShieldAlert /> : <Clock />}
                   </div>
                   <div>
                      <h4 className="font-black text-slate-800">{task.order_number}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{task.status.replace('_', ' ')}</p>
                   </div>
                </div>
                {task.status === 'PENDING_APPROVAL' && (
                  <button onClick={() => handleAdminApprove(task.id)} className="bg-rose-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase">Έγκριση</button>
                )}
              </div>
            ))}
          </div>
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white h-fit">
              <button onClick={async () => { await inventoryApi.seedInventory(); loadData(); }} className="w-full py-4 bg-blue-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 uppercase tracking-widest"><DatabaseZap size={16}/> Seed Inventory</button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-10 bg-slate-200 rounded-[4rem]">
          <div className="w-[360px] h-[640px] bg-slate-950 border-[8px] border-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <PickingListPDA onRefresh={loadData} />
          </div>
        </div>
      )}
    </div>
  );
};