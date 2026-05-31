import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { NotificationBell } from './components/NotificationBell';
import {Locations} from './pages/Locations';
import { Tasks } from './pages/Tasks';
import { ERP } from './pages/ERP';
import { Inventory } from './pages/Inventory';


function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Navbar */}
          <header className="h-20 bg-white border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-40">
            <div className="text-slate-400 font-medium italic">
              Dashboard / <span className="text-slate-800 not-italic">Overview</span>
            </div>
            <div className="flex items-center gap-6">
              <NotificationBell userId="admin_1" />
              <div className="flex items-center gap-3 border-l pl-6 border-slate-100">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">Administrator</p>
                  <p className="text-xs text-slate-400">Warehouse Alpha</p>
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/erp" element={<ERP />} />
              {/* Πρόσθεσε εδώ τις άλλες σελίδες όταν τις φτιάξεις */}
              <Route path="*" element={<div className="p-20 text-center text-slate-400 text-2xl font-bold">Υπό κατασκευή 🚧</div>} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
}

export default App;