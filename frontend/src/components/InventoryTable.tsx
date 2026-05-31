// components/InventoryTable.tsx
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion'; 
import { 
  Search, Filter, MoreVertical, 
  X, MapPin, History, ChevronRight, PackageX,
  Trash2, Download, ArrowUp, ArrowDown, ChevronLeft, Settings2, Check,
  GripVertical, RotateCcw, ArrowRight
} from 'lucide-react';
import type { Product } from '../types';

const ITEMS_PER_PAGE = 4;

const AVAILABLE_STATUSES = ['In Stock', 'Low Stock', 'Out of Stock'];

type SortKey = 'name' | 'category' | 'totalStock' | 'status';
type SortDirection = 'asc' | 'desc';

const InventoryTable = ({ products }: { products: Product[] }) => {
  // --- States ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeLocation, setActiveLocation] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('wms_column_order');
    return saved ? JSON.parse(saved) : ['checkbox', 'product', 'category', 'totalStock', 'status', 'action'];
  });

  const [visibleColumns, setVisibleColumns] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('wms_visible_columns');
    return saved ? JSON.parse(saved) : { category: true, totalStock: true, status: true };
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('wms_column_order', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem('wms_visible_columns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const currentSelectedProductLive = useMemo(() => {
    if (!selectedProduct) return null;
    return products.find(p => p.id === selectedProduct.id) || null;
  }, [products, selectedProduct]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRowIds([]);
  }, [searchTerm, activeCategory, sortConfig, statusFilter]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  const processedProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(product.status);
      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [searchTerm, activeCategory, products, sortConfig, statusFilter]);

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedProducts, currentPage]);

  const showingStart = processedProducts.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, processedProducts.length);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedRowIds(paginatedProducts.map(p => p.id));
    else setSelectedRowIds([]);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRowIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUp size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-blue-600" /> : <ArrowDown size={14} className="text-blue-600" />;
  };

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const resetToDefaultLayout = () => {
    setColumnOrder(['checkbox', 'product', 'category', 'totalStock', 'status', 'action']);
    setVisibleColumns({ category: true, totalStock: true, status: true });
    localStorage.removeItem('wms_column_order');
    localStorage.removeItem('wms_visible_columns');
  };

  const togglableColumns = ['category', 'totalStock', 'status'];

  return (
    <div className="relative">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative flex flex-col">
        
        {/* Header & Search */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Inventory Stock</h2>
              <p className="text-sm text-slate-400">Manage and track your warehouse levels</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto z-20">
              <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" placeholder="Search name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  />
                  {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={16} /></button>}
              </div>
              
              {/* Filter */}
              <div className="relative">
                <button onClick={() => setShowFilterMenu(!showFilterMenu)} disabled={isLoading} className={`relative p-2.5 border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusFilter.length > 0 || showFilterMenu ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}>
                  <Filter size={20} />
                  {statusFilter.length > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>}
                </button>
                <AnimatePresence>
                  {showFilterMenu && (
                    <>
                      <div className="fixed inset-0" onClick={() => setShowFilterMenu(false)} />
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by Status</h4>{statusFilter.length > 0 && <button onClick={() => setStatusFilter([])} className="text-[10px] font-bold text-blue-600 hover:underline">Clear</button>}</div>
                        <div className="p-2 flex flex-col">
                          {AVAILABLE_STATUSES.map((status) => {
                            const isChecked = statusFilter.includes(status);
                            return (
                              <label key={status} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}><Check size={14} className={isChecked ? "text-white" : "hidden"} /></div>
                                <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleStatusFilter(status)} />
                                <span className="text-sm font-semibold text-slate-700">{status}</span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Columns Settings */}
              <div className="relative">
                <button onClick={() => setShowColumnSettings(!showColumnSettings)} disabled={isLoading} className={`p-2.5 border rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${showColumnSettings ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'}`}>
                  <Settings2 size={20} />
                </button>
                <AnimatePresence>
                  {showColumnSettings && (
                    <>
                      <div className="fixed inset-0" onClick={() => setShowColumnSettings(false)} />
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configure Columns</h4><button onClick={resetToDefaultLayout} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-bold"><RotateCcw size={12} /> Reset</button></div>
                        <Reorder.Group axis="y" values={columnOrder} onReorder={setColumnOrder} className="p-2 flex flex-col gap-1">
                          {columnOrder.map((colId) => {
                            const isTogglable = togglableColumns.includes(colId);
                            const isVisible = isTogglable ? visibleColumns[colId] : true;
                            const displayName = colId === 'checkbox' ? 'Checkboxes' : colId === 'product' ? 'Product Info' : colId === 'totalStock' ? 'Total Stock' : colId === 'action' ? 'Actions' : colId;
                            return (
                              <Reorder.Item key={colId} value={colId} className="flex items-center justify-between px-3 py-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl cursor-grab active:cursor-grabbing transition-colors">
                                <div className="flex items-center gap-3"><GripVertical size={16} className="text-slate-400 shrink-0" /><span className="text-sm font-semibold text-slate-700 capitalize">{displayName}</span></div>
                                {isTogglable && <button onClick={() => toggleColumn(colId)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isVisible ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>{isVisible && <Check size={14} className="text-white" />}</button>}
                              </Reorder.Item>
                            );
                          })}
                        </Reorder.Group>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-slate-50 bg-slate-50/30 flex gap-2 overflow-x-auto hide-scrollbar z-10">
          {categories.map((category) => (
            <button
              key={category} onClick={() => setActiveCategory(category)} disabled={isLoading}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeCategory === category ? 'bg-slate-800 text-white shadow-md shadow-slate-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {category}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === category ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-400'}`}>
                {category === 'All' ? products.length : products.filter(p => p.category === category).length}
              </span>
            </button>
          ))}
        </div>

        {/* Πίνακας */}
        <div className="overflow-x-auto min-h-[300px] z-0 relative">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-white text-slate-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                {columnOrder.map((colId) => {
                  if (colId === 'checkbox') return <th key="col-check" className="px-6 py-4 border-b border-slate-50 w-12"><input type="checkbox" disabled={isLoading} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-50" checked={paginatedProducts.length > 0 && selectedRowIds.length === paginatedProducts.length} onChange={handleSelectAll} /></th>;
                  if (colId === 'product') return <th key="col-prod" className="px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 group" onClick={() => !isLoading && requestSort('name')}><div className="flex items-center gap-2">Product <SortIcon columnKey="name" /></div></th>;
                  if (colId === 'category' && visibleColumns.category) return <th key="col-cat" className="px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 group" onClick={() => !isLoading && requestSort('category')}><div className="flex items-center gap-2">Category <SortIcon columnKey="category" /></div></th>;
                  if (colId === 'totalStock' && visibleColumns.totalStock) return <th key="col-stock" className="px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 group" onClick={() => !isLoading && requestSort('totalStock')}><div className="flex items-center gap-2">Total Stock <SortIcon columnKey="totalStock" /></div></th>;
                  if (colId === 'status' && visibleColumns.status) return <th key="col-status" className="px-6 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 group" onClick={() => !isLoading && requestSort('status')}><div className="flex items-center gap-2">Status <SortIcon columnKey="status" /></div></th>;
                  if (colId === 'action') return <th key="col-action" className="px-6 py-4 border-b border-slate-50 text-right">Action</th>;
                  return null;
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    {columnOrder.map((colId) => {
                      if (colId === 'checkbox') return <td key="sk-check" className="px-6 py-4"><div className="w-4 h-4 rounded bg-slate-200"></div></td>;
                      if (colId === 'product') return <td key="sk-prod" className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div><div className="space-y-2 w-full"><div className="h-4 w-32 bg-slate-200 rounded"></div><div className="h-3 w-20 bg-slate-100 rounded"></div></div></div></td>;
                      if (colId === 'category' && visibleColumns.category) return <td key="sk-cat" className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>;
                      if (colId === 'totalStock' && visibleColumns.totalStock) return <td key="sk-stock" className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>;
                      if (colId === 'status' && visibleColumns.status) return <td key="sk-status" className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 rounded-full"></div></td>;
                      if (colId === 'action') return <td key="sk-action" className="px-6 py-4 flex justify-end"><div className="h-6 w-6 bg-slate-200 rounded mt-2"></div></td>;
                      return null;
                    })}
                  </tr>
                ))
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const isSelected = selectedRowIds.includes(product.id);
                  return (
                    <tr key={product.id} className={`transition-colors group/row cursor-pointer ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`} onClick={() => setSelectedProduct(product)}>
                      {columnOrder.map((colId) => {
                        if (colId === 'checkbox') return <td key="cell-check" className="px-6 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600" checked={isSelected} onChange={() => handleSelectRow(product.id)} /></td>;
                        if (colId === 'product') return <td key="cell-prod" className="px-6 py-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover/row:bg-blue-100 group-hover/row:text-blue-600'}`}>{product.name.charAt(0)}</div><div><div className="font-bold text-slate-700 group-hover/row:text-blue-600 transition-colors">{product.name}</div><div className="text-xs text-slate-400 font-mono">{product.sku}</div></div></div></td>;
                        if (colId === 'category' && visibleColumns.category) return <td key="cell-cat" className="px-6 py-4 text-slate-500 text-sm font-medium">{product.category}</td>;
                        if (colId === 'totalStock' && visibleColumns.totalStock) return <td key="cell-stock" className="px-6 py-4 font-bold text-slate-700">{product.totalStock} <span className="text-[10px] text-slate-400 font-normal">units</span></td>;
                        if (colId === 'status' && visibleColumns.status) return <td key="cell-status" className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${product.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : product.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{product.status}</span></td>;
                        if (colId === 'action') return <td key="cell-action" className="px-6 py-4 text-right"><button className="text-slate-300 hover:text-slate-600 p-1" onClick={(e) => { e.stopPropagation(); }}><MoreVertical size={20}/></button></td>;
                        return null;
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400"><div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><PackageX size={32} className="text-slate-300" /></div><h3 className="text-lg font-bold text-slate-700 mb-1">No products found</h3><p className="text-sm">We couldn't find anything matching your filters.</p><button onClick={() => { setSearchTerm(''); setActiveCategory('All'); setStatusFilter([]); }} className="mt-4 text-blue-600 font-medium text-sm hover:underline">Clear all filters</button></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">{isLoading ? <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div> : <>Showing <span className="font-bold text-slate-700">{showingStart}</span> to <span className="font-bold text-slate-700">{showingEnd}</span> of <span className="font-bold text-slate-700">{processedProducts.length}</span> products</>}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-1 px-2">{isLoading ? <div className="flex gap-1"><div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div><div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div></div> : Array.from({ length: totalPages }).map((_, idx) => { const page = idx + 1; return <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>{page}</button>; })}</div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0 || isLoading} className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* FLOATING BATCH ACTION BAR */}
      <AnimatePresence>
        {selectedRowIds.length > 0 && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-40 border border-slate-700">
            <span className="font-semibold text-sm flex items-center gap-3"><span className="bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">{selectedRowIds.length}</span>products selected</span>
            <div className="w-px h-6 bg-slate-700"></div><button className="flex items-center gap-2 text-sm font-semibold hover:text-blue-400 transition-colors"><Download size={16} /> Export</button><button className="flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors"><Trash2 size={16} /> Delete</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDE-OVER PANEL */}
      <AnimatePresence>
        {currentSelectedProductLive && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedProduct(null); setActiveLocation(null); }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed right-0 top-0 h-screen bg-white shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-300 ${activeLocation ? 'w-full max-w-3xl' : 'w-full max-w-md'}`}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div><h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Inventory Detail</h3><h2 className="text-xl font-black text-slate-800">{currentSelectedProductLive.name}</h2></div>
                <button onClick={() => { setSelectedProduct(null); setActiveLocation(null); }} className="p-2 hover:bg-white rounded-full shadow-sm"><X/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><MapPin size={14}/> Stock Locations ({currentSelectedProductLive.locations.length})</h4>
                    <div className="space-y-3">
                        {currentSelectedProductLive.locations.map((loc) => (
                            <button key={loc.code} onClick={() => setActiveLocation(loc)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${activeLocation?.code === loc.code ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                                <div><div className="text-lg font-bold text-slate-700">{loc.code}</div><div className="text-xs text-slate-400 font-medium">{loc.zone}</div></div>
                                <div className="flex items-center gap-3"><div className="text-right"><div className="text-xl font-black text-slate-800">{loc.currentStock}</div><div className="text-[10px] text-slate-400 uppercase">Current</div></div><ChevronRight size={18} className="text-slate-300"/></div>
                            </button>
                        ))}
                    </div>
                </section>
                <AnimatePresence mode="wait">
                    {activeLocation ? (
                        (() => {
                          const liveLocation = currentSelectedProductLive.locations.find(l => l.code === activeLocation.code);
                          if (!liveLocation) return null;
                          return (
                            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key={liveLocation.code} className="pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4 text-slate-400">
                                  <h4 className="text-xs font-bold uppercase flex items-center gap-2"><History size={14}/> Transaction Audit Trail: {liveLocation.code}</h4>
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">{liveLocation.movements.length} logs</span>
                                </div>
                                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                                  <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                      <tr>
                                        <th className="px-4 py-3">Date & User</th>
                                        <th className="px-4 py-3">Task & Reason</th>
                                        <th className="px-4 py-3">Route (Source → Dest)</th>
                                        <th className="px-4 py-3 text-right">Qty</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                                      {liveLocation.movements.length > 0 ? (
                                        liveLocation.movements.map((move) => (
                                          <tr key={move.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3"><div className="font-mono text-xs text-slate-800">{move.date}</div><div className="text-[10px] text-slate-400 mt-0.5">👤 {move.user}</div></td>
                                            <td className="px-4 py-3"><span className="inline-block font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{move.taskId}</span><div className="text-xs text-slate-500 mt-1 italic">{move.reason}</div></td>
                                            <td className="px-4 py-3"><div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50/50 p-1.5 rounded-lg border border-slate-100/50 w-fit"><span className="font-mono">{move.source}</span><ArrowRight size={12} className="text-slate-400 shrink-0" /><span className="font-mono text-blue-600">{move.destination}</span></div></td>
                                            <td className="px-4 py-3 text-right"><span className={`inline-block font-bold text-xs ${move.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>{move.type === 'IN' ? '+' : '-'}{move.qty}</span></td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No logs found for this location.</td></tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                            </motion.section>
                          );
                        })()
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300"><History size={24} className="mb-2 opacity-20"/><p className="text-sm font-medium">Select a location to see history</p></div>
                    )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryTable;