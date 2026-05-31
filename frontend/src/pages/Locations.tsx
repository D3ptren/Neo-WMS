import React, { useEffect, useState } from 'react';
import { 
  MapPin, Layers, Loader2, Plus, DatabaseZap, LayoutGrid, 
  List as ListIcon, Search, ChevronRight, X, Settings2, 
  Warehouse, Power, PowerOff, Save
} from 'lucide-react';
import { inventoryApi } from '../api/api';
import { toast } from 'sonner';

// Επέκταση του Interface για να περιλαμβάνει τα νέα πεδία
interface Location {
  id: number;
  code: string;
  zone: string;
  warehouse: string;
  is_active: boolean;
}

export const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  
  // States για το Modal Επεξεργασίας
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchLocations = async () => {
    try {
      const data = await inventoryApi.getLocations();
      setLocations(data);
    } catch (error) {
      toast.error("Αποτυχία φόρτωσης τοποθεσιών");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const handleOpenEdit = (loc: Location) => {
    setSelectedLoc({ ...loc });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoc) return;

    try {
      await inventoryApi.updateLocation(selectedLoc.id, {
        zone: selectedLoc.zone,
        warehouse: selectedLoc.warehouse,
        is_active: selectedLoc.is_active
      });
      toast.success(`Η τοποθεσία ${selectedLoc.code} ενημερώθηκε!`);
      setIsEditModalOpen(false);
      fetchLocations();
    } catch (error) {
      toast.error("Σφάλμα κατά την αποθήκευση");
    }
  };

  const filteredLocations = locations.filter(loc => 
    loc.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loc.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Τοποθεσίες</h1>
          <p className="text-slate-500 font-medium">Διαχείριση Χωροταξίας & Κατάστασης Ραφιών</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}><ListIcon size={20} /></button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Αναζήτηση (Κωδικός ή Ζώνη)..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"><Plus size={18} /> Νέα Θέση</button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLocations.map((loc) => (
            <div 
              key={loc.id} 
              onClick={() => handleOpenEdit(loc)}
              className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all cursor-pointer group relative overflow-hidden ${
                loc.is_active ? 'border-transparent hover:border-blue-500 hover:shadow-2xl' : 'opacity-60 grayscale border-slate-200 bg-slate-100'
              }`}
            >
              {!loc.is_active && (
                <div className="absolute top-4 right-6 flex items-center gap-1 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                  <PowerOff size={12} /> Offline
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl shadow-sm transition-colors ${loc.is_active ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <MapPin size={28} />
                </div>
                {loc.is_active && <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">Active</span>}
              </div>
              
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-2 italic">{loc.code}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Warehouse size={12} /> {loc.warehouse}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-slate-500">
                <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md">{loc.zone}</span>
                <Settings2 size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Κωδικός</th>
                <th className="px-8 py-5">Αποθήκη</th>
                <th className="px-8 py-5">Ζώνη</th>
                <th className="px-8 py-5 text-center">Κατάσταση</th>
                <th className="px-8 py-5 text-right">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLocations.map((loc) => (
                <tr key={loc.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => handleOpenEdit(loc)}>
                  <td className="px-8 py-5 font-black text-slate-800 text-lg italic">{loc.code}</td>
                  <td className="px-8 py-5 text-slate-500 font-bold text-sm uppercase">{loc.warehouse}</td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">{loc.zone}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {loc.is_active ? 
                      <span className="text-emerald-500 font-black text-[10px] uppercase">● Active</span> : 
                      <span className="text-slate-400 font-black text-[10px] uppercase">○ Disabled</span>
                    }
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-300 group-hover:text-blue-600 transition-colors"><Settings2 size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                    <Settings2 size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Επεξεργασία {selectedLoc.code}</h2>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={28} /></button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Όνομα Αποθήκης</label>
                  <input 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-700"
                    value={selectedLoc.warehouse} 
                    onChange={e => setSelectedLoc({...selectedLoc, warehouse: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ζώνη Αποθήκευσης</label>
                  <input 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-700"
                    value={selectedLoc.zone} 
                    onChange={e => setSelectedLoc({...selectedLoc, zone: e.target.value})}
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedLoc.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {selectedLoc.is_active ? <Power size={20} /> : <PowerOff size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase">Κατάσταση Θέσης</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLoc.is_active ? 'Ενεργή (In Use)' : 'Ανενεργή (Disabled)'}</p>
                      </div>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setSelectedLoc({...selectedLoc, is_active: !selectedLoc.is_active})}
                     className={`w-14 h-8 rounded-full relative transition-all duration-300 ${selectedLoc.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${selectedLoc.is_active ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 active:scale-95">
                <Save size={20} /> Αποθήκευση Αλλαγών
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};