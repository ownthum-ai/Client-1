"use client";
import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
   BuildingOfficeIcon,
   TruckIcon,
   ComputerDesktopIcon,
   BriefcaseIcon,
   PlusIcon,
   MagnifyingGlassIcon,
   EllipsisVerticalIcon,
   ArrowPathIcon,
   DocumentTextIcon,
   TrashIcon,
   WrenchScrewdriverIcon,
   ArrowUpIcon,
   ArrowDownIcon,
   ArrowDownTrayIcon,
   XMarkIcon,
   SparklesIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

export default function FixedAssetPage() {
   const { assets, addAsset, updateAssetCondition, deleteAsset, updateAsset } = useStore();
   const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
   const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [isExporting, setIsExporting] = useState(false);
   const [filterCategory, setFilterCategory] = useState<string | null>(null);
   const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);

   const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
   };

   const [addForm, setAddForm] = useState({
      name: '',
      category: 'Heavy Equipment' as any,
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      price: 0,
      location: '',
      usefulLife: 5
   });

   const [editForm, setEditForm] = useState({
      name: '',
      category: 'Heavy Equipment' as any,
      vendor: '',
      price: 0,
      location: ''
   });

   const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);

   const totalValue = assets.reduce((acc, a) => acc + a.price, 0);

   const filteredAssets = useMemo(() => {
      return assets.filter(a => {
         const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.vendor.toLowerCase().includes(searchTerm.toLowerCase());
         const matchesCategory = filterCategory ? a.category === filterCategory : true;
         return matchesSearch && matchesCategory;
      });
   }, [assets, searchTerm, filterCategory]);

   const categorySummary = useMemo(() => {
      const categories = [
         { name: 'Heavy Equipment', color: 'var(--gold)' },
         { name: 'Construction Tools', label: 'Construction', color: 'var(--amber)' },
         { name: 'IT Equipment', label: 'IT Assets', color: 'var(--blue)' },
         { name: 'Office Items', label: 'Office Assets', color: 'var(--slate)' }
      ];
      return categories.map(cat => {
         const catAssets = assets.filter(a => a.category === cat.name);
         const value = catAssets.reduce((acc, a) => acc + a.price, 0);
         const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
         return { ...cat, value, percentage, count: catAssets.length };
      });
   }, [assets, totalValue]);

   const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('en-IN', {
         style: 'currency',
         currency: 'INR',
         maximumFractionDigits: 0
      }).format(val);
   };

   const handleAddAsset = (e: React.FormEvent) => {
      e.preventDefault();
      addAsset({
         ...addForm,
         condition: 'Active',
         date: new Date(addForm.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      });
      setIsAddModalOpen(false);
      showToast(`${addForm.name} registered — ₹${addForm.price.toLocaleString('en-IN')} capital deployed`);
      setAddForm({ name: '', category: 'Heavy Equipment', date: new Date().toISOString().split('T')[0], vendor: '', price: 0, location: '', usefulLife: 5 });
   };

   const handleEditAsset = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedAssetId) {
         updateAsset(selectedAssetId, editForm);
         setIsEditModalOpen(false);
      }
   };

   const handleExport = async () => {
      setIsExporting(true);
      try {
         const csvData = assets.map(a => ({
            Name: a.name,
            Category: a.category,
            Price: a.price,
            Location: a.location,
            Condition: a.condition,
            Vendor: a.vendor,
            Acquisition_Date: a.date
         }));
         const { exportToCSV } = await import('@/utils/export');
         exportToCSV(csvData, `Asset_Registry_${new Date().toISOString().split('T')[0]}`);
      } catch (err) {
         console.error(err);
      } finally {
         setIsExporting(false);
      }
   };

   const kpis = [
      { label: 'Portfolio Value', value: formatCurrency(totalValue), color: 'gold', trend: { value: 'CapEx Total', type: 'neutral' as const } },
      { label: 'Active Infrastructure', value: `${assets.filter(a => a.condition === 'Active').length} Units`, color: 'green', trend: { value: 'Safe & Operational', type: 'up' as const } },
      { label: 'Maintenance Buffer', value: `${assets.filter(a => a.condition === 'Under Repair').length} Repairs`, color: 'blue', trend: { value: 'Service Protocol', type: 'neutral' as const } },
      { label: 'Disposal Audit', value: formatCurrency(assets.filter(a => a.condition === 'Disposed').reduce((acc, a) => acc + a.price, 0)), color: 'red', trend: { value: 'Life Cycle End', type: 'neutral' as const } },
   ];

   return (
      <div className="space-y-[var(--section-gap)] animate-in fade-in duration-150 pb-20 text-left relative" onClick={() => setActiveMenuId(null)}>
         {/* Toast Notification */}
         {toast && (
            <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[600] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 border border-white/10 backdrop-blur-md ${toast.type === 'warning' ? 'bg-[var(--red)]' : 'bg-[var(--sb)]'}`}>
               <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_var(--gold)] ${toast.type === 'warning' ? 'bg-white' : 'bg-[var(--gold)]'}`}></div>
               <span className="text-[11px] font-black uppercase tracking-[3px] font-serif">{toast.message}</span>
            </div>
         )}
         {/* V2 Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
               <h1 className="text-[28px] font-semibold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Fixed Assets</h1>
               <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--green-lt)] text-[var(--green)] border border-[var(--green)]/20 uppercase tracking-wider">
                     <span className="w-1 h-1 rounded-full bg-[var(--green)] mr-1.5 animate-pulse"></span>
                     LIVE OPERATIONAL STREAM
                  </span>
                  <span className="text-[11px] text-[var(--text3)] font-medium tabular-nums uppercase tracking-tight opacity-50">Heavy equipment, tools and IT infrastructure registry</span>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Button
                  v2={true}
                  variant="secondary"
                  size="default"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-6"
               >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export CSV'}
               </Button>
               <div className="h-8 w-[1px] bg-[var(--border)] mx-2"></div>
               <Button
                  v2={true}
                  size="default"
                  className="px-8 shadow-xl shadow-black/10 transition-all hover:scale-[1.02]"
                  onClick={() => setIsAddModalOpen(true)}
               >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Asset
               </Button>
            </div>
         </div>
         {/* KPI Matrix: Match HTML sg4 grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
            {kpis.map((k, i) => (
               <KPICard
                  key={i}
                  label={k.label}
                  value={k.value.toString()}
                  color={k.color}
                  trend={k.trend}
               />
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 items-start">
            {/* Asset Register Ledger */}
            <Card className="bg-white border-[var(--border)] shadow-sm overflow-hidden text-left">
               <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg)]/30">
                  <h2 className="text-[16px] font-bold text-[var(--text)] font-serif">Asset Central Registry</h2>
                  <div className="relative group w-64">
                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text3)] z-10" />
                     <Input
                        placeholder="Filter assets..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                     {filterCategory && (
                        <button
                           onClick={() => setFilterCategory(null)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--gold)] uppercase hover:underline"
                        >
                           Clear
                        </button>
                     )}
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                           <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Infrastructure Payload</th>
                           <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px]">Vertical</th>
                           <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] text-right">Valuation</th>
                           <th className="p-[12px_15px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] text-center">Lifecycle</th>
                           <th className="p-[12px_24px] text-[10px] font-bold text-[var(--text3)] uppercase tracking-[1px] text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[var(--border)]">
                        {filteredAssets.map((asset) => (
                           <tr key={asset.id}
                              className={`hover:bg-[var(--bg)]/50 transition-all group cursor-pointer ${selectedAssetId === asset.id ? 'bg-[var(--bg)]' : ''}`}
                              onClick={() => { setSelectedAssetId(asset.id); setActiveMenuId(null); }}
                           >
                              <td className="p-[12px_24px]">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--gold-lt)] border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] group-hover:scale-110 transition-transform">
                                       {asset.category === 'Heavy Equipment' ? <TruckIcon className="w-5 h-5" /> :
                                          asset.category === 'IT Equipment' ? <ComputerDesktopIcon className="w-5 h-5" /> :
                                             asset.category === 'Construction Tools' ? <WrenchScrewdriverIcon className="w-5 h-5" /> :
                                                <BriefcaseIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                       <div className="text-[13px] font-bold text-[var(--text)] uppercase tracking-tight leading-none group-hover:text-[var(--gold)] transition-colors mb-1.5">{asset.name}</div>
                                       <div className="text-[10px] text-[var(--text3)] font-bold uppercase tracking-widest leading-none opacity-40 italic">{asset.location} Node</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-[12px_15px]">
                                 <Badge variant="outline" className="border-[var(--border)] text-[var(--text3)] text-[10px] font-bold uppercase">
                                    {asset.category.replace(' Equipment', '').replace(' Items', '')}
                                 </Badge>
                              </td>
                              <td className="p-[12px_15px] text-right font-bold text-[14px] text-[var(--text)] font-price tabular-nums">
                                 {formatCurrency(asset.price)}
                              </td>
                              <td className="p-[12px_15px] text-center">
                                 <Badge
                                    variant={asset.condition === 'Active' ? 'success' : asset.condition === 'Under Repair' ? 'warning' : 'destructive'}
                                    className="uppercase tracking-widest text-[9px] font-black px-2.5 py-1"
                                 >
                                    {asset.condition}
                                 </Badge>
                              </td>
                              <td className="p-[12px_24px] text-right relative">
                                 <Button
                                    variant="ghost"
                                    size="icon"
                                    className="!bg-[var(--bg)] !border-[var(--border)] text-[var(--text3)] hover:!text-[var(--gold)] hover:!bg-white rounded-xl shadow-sm"
                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === asset.id ? null : asset.id); }}
                                 >
                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                 </Button>
                                 {activeMenuId === asset.id && (
                                    <div className="absolute right-6 top-full mt-2 w-48 bg-white border border-[var(--border)] rounded-2xl shadow-2xl z-[300] py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                       <button
                                          className="w-full text-left px-5 py-2.5 text-[10px] font-black text-[var(--text2)] hover:bg-[var(--bg)] uppercase tracking-widest flex items-center gap-3 transition-colors"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             setEditForm({ name: asset.name, category: asset.category, vendor: asset.vendor, price: asset.price, location: asset.location });
                                             setIsEditModalOpen(true);
                                             setActiveMenuId(null);
                                          }}
                                       >
                                          <DocumentTextIcon className="w-4 h-4 text-[var(--gold)]" />
                                          Edit Entry
                                       </button>
                                       <button
                                          className="w-full text-left px-5 py-2.5 text-[10px] font-black text-[var(--text2)] hover:bg-[var(--bg)] uppercase tracking-widest flex items-center gap-3 transition-colors"
                                          onClick={(e) => { e.stopPropagation(); setSelectedAssetId(asset.id); setIsConditionModalOpen(true); setActiveMenuId(null); }}
                                       >
                                          <ArrowPathIcon className="w-4 h-4 text-[var(--blue)]" />
                                          Cycle State
                                       </button>
                                       <div className="h-px bg-[var(--border)] my-2 mx-5"></div>
                                       <button
                                          className="w-full text-left px-5 py-2.5 text-[10px] font-black text-[var(--red)] hover:bg-red-50 uppercase tracking-widest flex items-center gap-3 transition-colors"
                                          onClick={(e) => { e.stopPropagation(); if (confirm('Archive this record?')) deleteAsset(asset.id); setActiveMenuId(null); }}
                                       >
                                          <TrashIcon className="w-4 h-4" />
                                          Archive Node
                                       </button>
                                    </div>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>

            {/* Sidebar: Portfolio Matrix */}
            <div className="space-y-[var(--section-gap)]">
               <Card className="bg-white border-[var(--border)] p-8 shadow-sm text-left">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                        <BuildingOfficeIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-[18px] font-serif text-[var(--text)] leading-none mb-1">Portfolio Matrix</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text3)]">Capital Sourcing Audit</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     {categorySummary.map((cat, i) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-[12px] font-bold text-[var(--text2)] uppercase tracking-wider">{cat.label || cat.name}</span>
                              <div className="text-right">
                                 <div className="text-[13px] font-bold text-[var(--text)] font-price leading-none">{formatCurrency(cat.value)}</div>
                                 <div className="text-[9px] text-[var(--text3)] font-bold uppercase mt-1">{cat.count} Units</div>
                              </div>
                           </div>
                           <div className="h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                              <div
                                 className="h-full rounded-full transition-all duration-1000"
                                 style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                              ></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>

               <Card className="bg-[var(--sb)] text-white p-8 shadow-lg text-left relative overflow-hidden group border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full group-hover:bg-white/10 transition-all duration-700"></div>
                  <div className="relative z-10">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 shadow-inner">
                        <SparklesIcon className="w-6 h-6 text-[var(--gold)]" />
                     </div>
                     <h3 className="text-[20px] font-serif mb-3 tracking-tight">Lifecycle Insight</h3>
                     <p className="text-[13px] text-white/60 mb-8 leading-relaxed italic pr-4">Maintenance costs for IT Assets have spiked 14%. Recommend auditing vendor lifecycle protocols?</p>
                     <Button
                        v2={true}
                        onClick={() => { setFilterCategory('IT Equipment'); showToast?.('Filtering IT infrastructure for audit...'); }}
                        className="w-full !bg-white !text-black hover:!bg-[var(--gold)] hover:!text-white transition-all h-14 rounded-2xl shadow-xl shadow-black/20 text-[11px] font-black uppercase tracking-[3px]"
                     >
                        Audit Lifecycle Nodes ↗
                     </Button>
                  </div>
               </Card>
            </div>
         </div>         {/* Register Asset Protocol (Refactored to V2 Modal) */}
         {isAddModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
               <div className="bg-white rounded-xl p-0 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                  <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                           <BuildingOfficeIcon className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">Asset Registry</h2>
                           <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] mt-1 opacity-60">Register new capital infrastructure node</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsAddModalOpen(false)}>✕</Button>
                  </div>
                  
                  <form onSubmit={handleAddAsset} className="p-8 space-y-8 text-left">
                     <div className="space-y-4">
                        <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Asset Nomenclature</label>
                        <Input
                           required
                           v2={true}
                           value={addForm.name}
                           onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                           placeholder="ENTER INFRASTRUCTURE IDENTITY..."
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Vertical Axis</label>
                           <Select
                              v2={true}
                              value={addForm.category}
                              onChange={e => setAddForm({ ...addForm, category: e.target.value as any })}
                           >
                              <option value="Heavy Equipment">HEAVY EQUIPMENT</option>
                              <option value="Construction Tools">CONSTRUCTION TOOLS</option>
                              <option value="IT Equipment">IT EQUIPMENT</option>
                              <option value="Office Items">OFFICE ITEMS</option>
                           </Select>
                        </div>
                        <div className="space-y-4">
                           <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Initial Value (₹)</label>
                           <Input
                              required
                              v2={true}
                              type="number"
                              value={addForm.price || ''}
                              onChange={e => setAddForm({ ...addForm, price: Number(e.target.value) })}
                              placeholder="0.00"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Acquisition Date</label>
                           <Input
                              required
                              v2={true}
                              type="date"
                              value={addForm.date}
                              onChange={e => setAddForm({ ...addForm, date: e.target.value })}
                           />
                        </div>
                        <div className="space-y-4">
                           <label className="block text-[10px] font-black text-[var(--text3)] uppercase tracking-[2px] px-1">Physical Node</label>
                           <Input
                              required
                              v2={true}
                              value={addForm.location}
                              onChange={e => setAddForm({ ...addForm, location: e.target.value })}
                              placeholder="Location..."
                           />
                        </div>
                     </div>

                     <div className="pt-4 flex gap-4">
                        <Button 
                           type="button" 
                           variant="secondary" 
                           v2={true}
                           className="flex-1 h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px]" 
                           onClick={() => setIsAddModalOpen(false)}
                        >
                           Abort
                        </Button>
                        <Button 
                           type="submit" 
                           v2={true}
                           className="flex-[2] h-12 rounded-xl shadow-lg shadow-[var(--gold)]/10 font-bold uppercase tracking-[3px] text-[10px]"
                        >
                           Commit Capital Registry
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Asset Lifecycle Protocol (Refactored to V2 Modal) */}
         {isConditionModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
               <div className="bg-white rounded-xl p-0 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden">
                  <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[var(--gold)]">
                           <WrenchScrewdriverIcon className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-[18px] font-black text-[var(--text)] tracking-tight uppercase font-serif">Lifecycle State</h2>
                           <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[2px] mt-1 opacity-60">Transition operational status</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-lg border-[var(--border)]" onClick={() => setIsConditionModalOpen(false)}>✕</Button>
                  </div>
                  
                  <div className="p-8 space-y-4 text-left">
                      {(['Active', 'Under Repair', 'Disposed'] as any[]).map(cond => (
                         <button
                            key={cond}
                            onClick={() => {
                               updateAssetCondition(selectedAssetId!, cond);
                               setIsConditionModalOpen(false);
                               if (cond === 'Disposed') {
                                  showToast(`${selectedAsset?.name} disposed — removed from active pool`, 'warning');
                               } else if (cond === 'Under Repair') {
                                  showToast(`${selectedAsset?.name} under repair since today`);
                               } else {
                                  showToast(`${selectedAsset?.name} restored to active status`);
                               }
                            }}
                            className="w-full p-4 flex items-center justify-between group rounded-xl border border-[var(--border)] hover:border-[var(--gold)] hover:bg-[var(--gold-lt)]/30 transition-all"
                         >
                           <span className="text-[11px] font-black uppercase tracking-[2px] text-[var(--text2)] group-hover:text-[var(--gold)]">{cond}</span>
                           <div className="w-6 h-6 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--gold)] group-hover:bg-white transition-all">
                              <div className={`w-2 h-2 rounded-full ${selectedAsset?.condition === cond ? 'bg-[var(--gold)]' : 'bg-transparent'}`}></div>
                           </div>
                        </button>
                     ))}

                     <div className="pt-4">
                        <Button 
                           variant="secondary" 
                           v2={true} 
                           className="w-full h-12 rounded-xl border-[var(--border)] font-bold uppercase tracking-[2px] text-[10px]" 
                           onClick={() => setIsConditionModalOpen(false)}
                        >
                           Abort Protocol
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Asset Modal */}
         {isEditModalOpen && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
               <Card variant="premium" className="w-full max-w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-left relative">
                  <button onClick={() => setIsEditModalOpen(false)} className="absolute right-8 top-8 p-2 hover:bg-[var(--bg)] rounded-xl transition-colors">
                     <XMarkIcon className="w-6 h-6 text-[var(--text3)]" />
                  </button>
                  <div className="mb-10">
                     <div className="w-12 h-12 bg-[var(--gold-lt)] rounded-2xl flex items-center justify-center border border-[var(--gold)]/20 shadow-sm text-[22px] mb-5">
                        📝
                     </div>
                     <h3 className="text-[20px] font-bold text-[var(--text)] tracking-tight uppercase leading-tight mb-2 font-serif">Modify Asset Registry</h3>
                     <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-[3px] opacity-80">Authorized metadata transformation protocol</p>
                  </div>

                  <form onSubmit={handleEditAsset} className="space-y-6">
                     <div className="space-y-2">
                        <Label required className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Infrastructure Identity</Label>
                        <Input
                           v2={true}
                           required
                           value={editForm.name}
                           onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                           placeholder="Asset Name..."
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label required className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Vertical Axis</Label>
                           <Select
                              v2={true}
                              value={editForm.category}
                              onChange={e => setEditForm({ ...editForm, category: e.target.value as any })}
                           >
                              <option value="Heavy Equipment">HEAVY EQUIPMENT</option>
                              <option value="Construction Tools">CONSTRUCTION TOOLS</option>
                              <option value="IT Equipment">IT EQUIPMENT</option>
                              <option value="Office Items">OFFICE ITEMS</option>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label required className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Valuation (₹)</Label>
                           <Input
                              v2={true}
                              required
                              type="number"
                              value={editForm.price || ''}
                              onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                              placeholder="0.00"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label required className="text-[9px] font-bold text-[var(--text3)] uppercase tracking-[2px] ml-1">Deployment Location</Label>
                        <Input
                           v2={true}
                           required
                           value={editForm.location}
                           onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                           placeholder="Physical Node Location..."
                        />
                     </div>
                     <div className="pt-6 flex gap-4">
                        <Button type="button" variant="secondary" v2={true} className="flex-1 h-14 rounded-2xl" onClick={() => setIsEditModalOpen(false)}>Abort</Button>
                        <Button type="submit" variant="primary" v2={true} className="flex-1 h-14 rounded-2xl shadow-xl shadow-gold-500/20 text-[11px] font-black uppercase tracking-[2px]">Commit Changes</Button>
                     </div>
                  </form>
               </Card>
            </div>
         )}
           {/* Asset Profile Protocol (Refactored to V2 Modal) */}
         {selectedAsset && !activeMenuId && !isEditModalOpen && !isConditionModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4 animate-in fade-in duration-500">
               <div className="bg-white rounded-xl p-0 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-8 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center text-left">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[var(--gold-lt)] rounded-2xl flex items-center justify-center text-[var(--gold)] border border-[var(--gold)]/20 shadow-inner">
                           {selectedAsset.category === 'Heavy Equipment' ? <TruckIcon className="w-7 h-7" /> :
                              selectedAsset.category === 'IT Equipment' ? <ComputerDesktopIcon className="w-7 h-7" /> :
                                 <BriefcaseIcon className="w-7 h-7" />}
                        </div>
                        <div>
                           <h2 className="text-[18px] font-black text-[var(--text)] uppercase tracking-tight leading-none mb-2 font-serif">{selectedAsset.name}</h2>
                           <p className="text-[10px] text-[var(--text3)] font-black uppercase tracking-[3px] leading-none opacity-40 italic">{selectedAsset.category}</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-xl border-[var(--border)]" onClick={() => setSelectedAssetId(null)}>✕</Button>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto scrollbar-hide text-left space-y-10">
                     {/* Asset Value Card */}
                     <Card className="bg-[var(--sb)] rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12 pointer-events-none">
                           <BuildingOfficeIcon className="w-48 h-48" />
                        </div>
                        <div className="relative z-10">
                           <p className="text-[10px] font-bold text-white/40 uppercase tracking-[4px] mb-2">Authenticated Valuation</p>
                           <h4 className="text-4xl font-black text-[var(--gold)] font-price mb-10 tracking-tighter">{formatCurrency(selectedAsset.price)}</h4>
                           <div className="flex gap-4">
                              <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">State</p>
                                 <p className="text-[11px] font-bold uppercase">{selectedAsset.condition}</p>
                              </div>
                              <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                                 <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Node</p>
                                 <p className="text-[11px] font-bold uppercase truncate">{selectedAsset.location}</p>
                              </div>
                           </div>
                        </div>
                     </Card>

                     {/* Itemized Grid */}
                     <div className="grid grid-cols-2 gap-5">
                        <div className="p-6 bg-[var(--bg)] rounded-3xl border border-[var(--border)] group hover:border-[var(--gold)] transition-all">
                           <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2px] opacity-40 block mb-2">Registry ID</span>
                           <span className="text-[12px] font-bold text-[var(--text)] uppercase">#AST-{selectedAsset.id.slice(-4)}</span>
                        </div>
                        <div className="p-6 bg-[var(--bg)] rounded-3xl border border-[var(--border)] group hover:border-[var(--gold)] transition-all">
                           <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2px] opacity-40 block mb-2">Acquisition</span>
                           <span className="text-[12px] font-bold text-[var(--text)] uppercase">{selectedAsset.date}</span>
                        </div>
                        <div className="p-6 bg-[var(--bg)] rounded-3xl border border-[var(--border)] group hover:border-[var(--gold)] transition-all">
                           <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2px] opacity-40 block mb-2">Vendor Alias</span>
                           <span className="text-[12px] font-bold text-[var(--text)] uppercase truncate">{selectedAsset.vendor}</span>
                        </div>
                        <div className="p-6 bg-[var(--bg)] rounded-3xl border border-[var(--border)] group hover:border-[var(--gold)] transition-all">
                           <span className="text-[9px] font-black text-[var(--text3)] uppercase tracking-[2px] opacity-40 block mb-2">Life Expectancy</span>
                           <span className="text-[12px] font-bold text-[var(--text)] uppercase">{selectedAsset.usefulLife} Years</span>
                        </div>
                     </div>

                     {/* Nodal Control */}
                     <div className="space-y-4 pt-10 border-t border-[var(--border)] flex flex-col gap-3">
                        <p className="text-[10px] font-black text-[var(--text3)] uppercase tracking-[3px] opacity-40 mb-4 ml-1">Operational Control</p>
                        <Button
                           v2={true}
                           className="w-full h-14 rounded-2xl shadow-lg text-[11px] font-black uppercase tracking-[3px]"
                           onClick={() => {
                              setEditForm({ name: selectedAsset.name, category: selectedAsset.category, vendor: selectedAsset.vendor, price: selectedAsset.price, location: selectedAsset.location });
                              setIsEditModalOpen(true);
                           }}
                        >
                           Modify Asset Metadata
                        </Button>
                        <Button
                           variant="secondary" v2={true}
                           className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[3px]"
                           onClick={() => setIsConditionModalOpen(true)}
                        >
                           Transition Lifecycle State
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
