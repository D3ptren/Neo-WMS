// frontend/src/pages/Inventory.tsx
import React, { useEffect, useState } from 'react';
import { 
  ClipboardCheck, AlertTriangle, CheckCircle2, 
  Search, MapPin, Package, Loader2, RefreshCcw,
  ArrowRight, Barcode, User, Clock
} from 'lucide-react';
import { inventoryApi } from '../api/api';
import { toast } from 'sonner';

// Ορισμός του τύπου δεδομένων για την TypeScript
interface AuditRecord {
  id: number;
  location_code: string;
  product_sku: string;
  expected_qty: number;
  counted_qty: number;
  variance: number;
  user: string;
  timestamp: string;
}

// ΠΡΟΣΟΧΗ: Named Export για να ταιριάζει με το App.tsx
export const Inventory: React.FC = () => {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<'all' | 'discrepancy'>('all');

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getAudits();
      setAudits(data);
    } catch (error) {
      toast.error("Αποτυχία φόρτωσης ιστορικού απογραφών");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  // Φιλτράρισμα δεδομένων
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = 
      audit.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.location_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterMode === 'all' ? true : audit.variance !== 0;
    
    return matchesSearch && matchesFilter;
  });

  if (loading && audits.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 flex-col gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Συγχρονισμός Απογραφών...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <ClipboardCheck size={36} className="text-blue-600" />
            Απογραφή
          </h1>
          <p className="text-slate-500 font-medium">Έλεγχος αποκλίσεων & Συμφωνία φυσικού αποθέματος</p>
        </div>
        <button 
          onClick={fetchAudits}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCcw size={18} /> Ανανέωση
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Αναζήτηση SKU ή Θέσης..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filterMode === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ΟΛΕΣ
          </button>
          <button 
            onClick={() => setFilterMode('discrepancy')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filterMode === 'discrepancy' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ΔΙΑΦΟΡΕΣ (!)
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5 text-center">Κατασταση</th>
              <th className="px-8 py-5">Πληροφοριες Κινησης</th>
              <th className="px-8 py-5">Τοποθεσια</th>
              <th className="px-8 py-5 text-center">Λογιστικο (ERP)</th>
              <th className="px-8 py-5 text-center">Φυσικο (PDA)</th>
              <th className="px-8 py-5 text-right">Διαφορα</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAudits.map((audit) => (
              <tr key={audit.id} className={`group hover:bg-slate-50 transition-colors ${audit.variance !== 0 ? 'bg-rose-50/20' : ''}`}>
                <td className="px-8 py-5 text-center">
                  {audit.variance === 0 ? (
                    <div className="inline-flex p-2 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
                  ) : (
                    <div className="inline-flex p-2 bg-rose-100 text-rose-600 rounded-xl animate-pulse"><AlertTriangle size={20} /></div>
                  )}
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
                      <Barcode size={14} className="text-slate-400" /> {audit.product_sku}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(audit.timestamp).toLocaleString('el-GR')}</span>
                      <span className="flex items-center gap-1"><User size={10} /> {audit.user}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-black text-blue-600 italic text-lg tracking-tighter">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-300" />
                    {audit.location_code}
                  </div>
                </td>
                <td className="px-8 py-5 text-center font-bold text-slate-400 text-sm">
                  {audit.expected_qty}
                </td>
                <td className="px-8 py-5 text-center font-black text-slate-800 text-lg">
                  {audit.counted_qty}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm shadow-sm ${
                    audit.variance === 0 ? 'bg-emerald-500 text-white' : 
                    audit.variance < 0 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {audit.variance > 0 ? `+${audit.variance}` : audit.variance}
                    {audit.variance !== 0 && <AlertTriangle size={14} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAudits.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center gap-4">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                <ClipboardCheck className="text-slate-200" size={40} />
             </div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Δεν βρέθηκαν αποτελέσματα απογραφής</p>
          </div>
        )}
      </div>
    </div>
  );
};