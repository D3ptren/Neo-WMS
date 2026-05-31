import React from 'react';
import { Package, AlertTriangle, Activity, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Δευ', in: 40, out: 24 }, { name: 'Τρι', in: 30, out: 13 },
  { name: 'Τετ', in: 20, out: 58 }, { name: 'Πεμ', in: 27, out: 39 },
  { name: 'Παρ', in: 18, out: 48 },
];

const StatTile = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export const Home = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Κέντρο Ελέγχου</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile title="Προϊόντα" value="1,240" icon={Package} color="bg-blue-500" />
        <StatTile title="Low Stock" value="14" icon={AlertTriangle} color="bg-red-500" />
        <StatTile title="Εργασίες" value="45" icon={Activity} color="bg-amber-500" />
        <StatTile title="Πληρότητα" value="82%" icon={MapPin} color="bg-emerald-500" />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6">Κίνηση Αποθήκης</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip />
              <Area type="monotone" dataKey="in" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};