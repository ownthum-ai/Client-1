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
   CheckCircleIcon,
   ShieldCheckIcon,
   InformationCircleIcon,
   ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPICard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';

export default function FixedItemPage() {
   const { assets, addAsset, updateAssetCondition } = useStore();
   const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      showToast(`${addForm.name} added successfully.`);
      setAddForm({ name: '', category: 'Heavy Equipment', date: new Date().toISOString().split('T')[0], vendor: '', price: 0, location: '', usefulLife: 5 });
   };


   const handleExport = async () => {
      setIsExporting(true);
      try {
         const csvData = assets.map(a => ({
            Name: a.name,
            Category: a.category,
            Price: a.price,
            Location: a.location,
            Rule: a.condition,
            Supplier: a.vendor,
            Acquisition_Date: a.date
         }));
         const { exportToCSV } = await import('@/utils/export');
         exportToCSV(csvData, `Item_List_${new Date().toISOString().split('T')[0]}`);
      } catch (err) {
         console.error(err);
      } finally {
         setIsExporting(false);
      }
   };

   const [mounted, setMounted] = React.useState(false); React.useEffect(() => { setMounted(true); }, []); if (!mounted) return null;

   return (
      <div className="space-y-[var(--section-gap)] pb-20 text-left relative" onClick={() => setActiveMenuId(null)}>
         {/* Toast Notification */}
         {toast && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-10 py-5 rounded-2xl shadow-2xl border-2 border-white/10 flex items-center gap-5">
               <div className={`w-3 h-3 rounded-full ${toast.type === 'warning' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
               <span className="text-[14px] font-bold tracking-tight uppercase">{toast.message}</span>
            </div>
         )}

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="text-left">
               <h1 className="text-[var(--h1-fs)] font-bold text-gray-900 tracking-tight leading-tight mb-2 uppercase">Company Assets</h1>
               <div className="flex items-center gap-3">
                  <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm uppercase">In Use</Badge>
                  <span className="text-[14px] text-gray-400 font-bold tabular-nums tracking-tight uppercase opacity-80">Equipment list</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <Button
                  variant="secondary"
                  size="default"
                  className="px-8 h-[56px] shadow-md rounded-xl border-2"
                  onClick={handleExport}
                  disabled={isExporting}
               >
                  <ArrowDownTrayIcon className="w-5 h-5 mr-3" /> Export CSV
               </Button>
               <Button
                  size="default"
                  className="px-10 h-[56px] shadow-lg rounded-xl"
                  onClick={() => setIsAddModalOpen(true)}
               >
                  <PlusIcon className="w-5 h-5 mr-3" /> Add Item
               </Button>
            </div>
         </div>

         {/* KPIs */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard label="Total Value" value={totalValue} trend={{ value: "Item Cost", type: "neutral" }} />
            <KPICard label="Items In Use" value={assets.filter(a => a.condition === 'Active').length} trend={{ value: "In Use", type: "up" }} />
            <KPICard label="Maintenance" value={assets.filter(a => a.condition === 'Under Repair').length} trend={{ value: "Under Service", type: "neutral" }} />
            <KPICard label="Removed Items" value={assets.filter(a => a.condition === 'Disposed').length} trend={{ value: "No Longer Used", type: "neutral" }} />
         </div>

         {/* Main List */}
         <Card title="Item List" subtitle="Items list" actions={
            <div className="relative w-80">
               <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
               <Input
                  placeholder="Filter by name..."
                  className="pl-12 h-12 border-2 rounded-xl shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  v2={true}
               />
            </div>
         } className="p-0 overflow-hidden shadow-lg border-2">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-100 border-b-2 border-[var(--border)]">
                        <th className="p-[16px_32px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Item Name</th>
                        <th className="p-[16px_20px] text-[11px] font-bold text-gray-500 tracking-widest uppercase">Category</th>
                        <th className="p-[16px_20px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Value</th>
                        <th className="p-[16px_20px] text-center text-[11px] font-bold text-gray-500 tracking-widest uppercase">Status</th>
                        <th className="p-[16px_32px] text-right text-[11px] font-bold text-gray-500 tracking-widest uppercase">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[var(--border)]">
                     {filteredAssets.map((item) => (
                        <tr key={item.id}
                           className="hover:bg-gray-50 cursor-pointer transition-none"
                           onClick={() => { setSelectedAssetId(item.id); setActiveMenuId(null); }}
                        >
                           <td className="p-[16px_32px]">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 rounded-2xl bg-gray-100 text-amber-600 flex items-center justify-center border-2 border-white shadow-sm">
                                    {item.category === 'Heavy Equipment' ? <TruckIcon className="w-6 h-6" /> :
                                       item.category === 'IT Equipment' ? <ComputerDesktopIcon className="w-6 h-6" /> :
                                          <BriefcaseIcon className="w-6 h-6" />}
                                 </div>
                                 <div className="flex flex-col text-left">
                                    <span className="text-[16px] font-bold text-gray-900 tracking-tight uppercase leading-none mb-2">{item.name}</span>
                                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider opacity-80">{item.location}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-[16px_20px]">
                              <Badge variant="neutral" className="px-3 py-1 text-[10px] font-bold uppercase shadow-sm">{item.category}</Badge>
                           </td>
                           <td className="p-[16px_20px] text-right font-bold text-[16px] text-gray-900 tabular-nums">
                              {formatCurrency(item.price)}
                           </td>
                           <td className="p-[16px_20px] text-center">
                              <Badge
                                 variant={item.condition === 'Active' ? 'success' : item.condition === 'Under Repair' ? 'warning' : 'destructive'}
                                 className="uppercase tracking-widest text-[10px] font-bold px-3 py-1 shadow-sm"
                              >
                                 {item.condition}
                              </Badge>
                           </td>
                           <td className="p-[16px_32px] text-right">
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-10 w-10 border-2 rounded-xl"
                                 onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
                              >
                                 <EllipsisVerticalIcon className="w-5 h-5" />
                              </Button>
                              {activeMenuId === item.id && (
                                 <div className="absolute right-12 mt-2 w-64 bg-white border-2 border-[var(--border)] rounded-2xl shadow-2xl z-[300] py-4 text-left overflow-hidden">
                                    <button
                                       className="w-full px-6 py-4 text-[12px] font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-[2px] flex items-center gap-4 transition-none"
                                       onClick={(e) => { e.stopPropagation(); setSelectedAssetId(item.id); setIsConditionModalOpen(true); setActiveMenuId(null); }}
                                    >
                                       <ArrowPathIcon className="w-5 h-5 text-blue-600" />
                                       Change status
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

         {/* Side Drawer for Details */}
         <div className={`fixed top-0 right-0 h-screen w-[520px] bg-white shadow-2xl z-[250] border-l-2 border-[var(--border)] flex flex-col transition-transform duration-300 ${selectedAssetId && !activeMenuId && !isAddModalOpen && !isConditionModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedAsset ? (
               <div className="flex-1 flex flex-col p-12 overflow-y-auto text-left">
                  <div className="flex items-center justify-between mb-12">
                     <div className="flex items-center gap-6">
                        <div className="modal-header-icon text-amber-600">
                           {selectedAsset.category === 'Heavy Equipment' ? <TruckIcon className="w-8 h-8" /> :
                              selectedAsset.category === 'IT Equipment' ? <ComputerDesktopIcon className="w-8 h-8" /> :
                                 <BriefcaseIcon className="w-8 h-8" />}
                        </div>
                        <div className="text-left">
                           <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">{selectedAsset.name}</h2>
                           <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">{selectedAsset.category}</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setSelectedAssetId(null)}>✕</Button>
                  </div>

                  <div className="space-y-12">
                     {/* Details Grid */}
                     <div className="grid grid-cols-2 gap-8">
                        <div className="p-10 bg-gray-50 rounded-[16px] border-2 border-gray-100 text-left shadow-sm">
                           <Label className="mb-3 block">Supplier</Label>
                           <span className="text-[16px] font-bold text-gray-900 uppercase tracking-tight">{selectedAsset.vendor || 'Supplier'}</span>
                        </div>
                        <div className="p-10 bg-gray-50 rounded-[16px] border-2 border-gray-100 text-left shadow-sm">
                           <Label className="mb-3 block">Use Time</Label>
                           <span className="text-[16px] font-bold text-gray-900 uppercase tracking-tight">{selectedAsset.usefulLife} years</span>
                        </div>
                     </div>

                     {/* Item Metadata */}
                     <div className="space-y-8">
                        <h3 className="text-[11px] font-bold text-gray-400 tracking-[3px] uppercase border-b-2 border-gray-100 pb-5">
                          Item Details
                        </h3>
                        <div className="space-y-5">
                           <div className="flex items-center justify-between p-8 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                              <Label>Item ID</Label>
                              <span className="text-[15px] font-bold text-gray-900 tabular-nums">#AST-{selectedAsset.id.slice(-8).toUpperCase()}</span>
                           </div>
                           <div className="flex items-center justify-between p-8 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                              <Label>Location</Label>
                              <span className="text-[15px] font-bold text-gray-900 uppercase tracking-tight">{selectedAsset.location}</span>
                           </div>
                           <div className="flex items-center justify-between p-8 bg-white rounded-xl border-2 border-gray-100 shadow-sm">
                              <Label>Date</Label>
                              <span className="text-[15px] font-bold text-gray-900 tabular-nums">{selectedAsset.date}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-6 p-10 bg-amber-50 rounded-[16px] border-2 border-amber-100 shadow-sm">
                        <ShieldCheckIcon className="w-10 h-10 text-amber-500 shrink-0" />
                        <p className="text-[13px] text-amber-800 font-bold leading-relaxed uppercase tracking-wide opacity-80">
                           Item checked and saved in the main list.
                        </p>
                     </div>
                  </div>

                  <div className="mt-auto pt-10">
                     <Button
                        variant="secondary"
                        className="w-full h-[56px] font-bold uppercase tracking-widest shadow-md rounded-2xl border-2 bg-white"
                        onClick={() => setSelectedAssetId(null)}
                     >
                        Close Detail
                     </Button>
                  </div>
               </div>
            ) : null}
         </div>

         {/* Add Asset Modal */}
         {isAddModalOpen && (
            <div className="modal-overlay">
               <div className="modal-container shadow-2xl">
                  <div className="modal-header">
                     <div className="flex items-center gap-6 text-left">
                        <div className="modal-header-icon text-amber-600">
                           <PlusIcon className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add Item</h2>
                           <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Add new item details</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAddModalOpen(false)}>✕</Button>
                  </div>
                  
                  <form onSubmit={handleAddAsset} className="modal-body space-y-10 text-left">
                     <div className="space-y-4">
                        <Label required>Item name</Label>
                        <Input
                           required
                           v2={true}
                           value={addForm.name}
                           onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                           placeholder="Enter item name"
                           className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <Label required>Item Category</Label>
                           <Select
                              v2={true}
                              value={addForm.category}
                              onChange={e => setAddForm({ ...addForm, category: e.target.value as any })}
                              className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                           >
                              <option value="Heavy Equipment">Heavy Equipment</option>
                              <option value="Construction Tools">Construction Tools</option>
                              <option value="IT Equipment">IT Equipment</option>
                              <option value="Office Items">Office Items</option>
                           </Select>
                        </div>
                        <div className="space-y-4">
                           <Label required>Price (₹)</Label>
                           <Input
                              required
                              v2={true}
                              type="number"
                              value={addForm.price || ''}
                              onChange={e => setAddForm({ ...addForm, price: Number(e.target.value) })}
                              placeholder="0.00"
                              className="h-[56px] shadow-md rounded-2xl font-bold text-amber-600 tabular-nums text-[18px] font-price"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <Label required>Date</Label>
                           <Input
                              required
                              v2={true}
                              type="date"
                              value={addForm.date}
                              onChange={e => setAddForm({ ...addForm, date: e.target.value })}
                              className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                           />
                        </div>
                        <div className="space-y-4">
                           <Label required>Location</Label>
                           <Input
                              required
                              v2={true}
                              value={addForm.location}
                              onChange={e => setAddForm({ ...addForm, location: e.target.value })}
                              placeholder="e.g. SITE ALPHA"
                              className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <Label required>Supplier / Source</Label>
                        <Input
                           required
                           v2={true}
                           value={addForm.vendor}
                           onChange={e => setAddForm({ ...addForm, vendor: e.target.value })}
                           placeholder="Enter supplier name"
                           className="h-[56px] shadow-md rounded-2xl font-bold uppercase"
                        />
                     </div>

                     <div className="flex items-center gap-5 p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <ShieldCheckIcon className="w-10 h-10 text-amber-500 shrink-0" />
                        <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                           This item will be saved to the list.
                        </p>
                     </div>

                     <div className="pt-6 flex gap-6">
                        <Button
                           type="button"
                           variant="secondary"
                           className="flex-1 h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2"
                           onClick={() => setIsAddModalOpen(false)}
                        >
                           Cancel
                        </Button>
                        <Button
                           type="submit"
                           variant="primary"
                           className="flex-[2] h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-xl"
                        >
                           Save Item
                        </Button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Status Modal */}
         {isConditionModalOpen && (
            <div className="modal-overlay">
               <div className="modal-container max-w-md shadow-2xl">
                  <div className="modal-header">
                     <div className="flex items-center gap-6 text-left">
                        <div className="modal-header-icon text-amber-600">
                           <ArrowPathIcon className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                           <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Item status</h2>
                           <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Change item status</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="icon" className="rounded-xl border-2 h-10 w-10 shadow-sm" onClick={() => setIsConditionModalOpen(false)}>✕</Button>
                  </div>
                  
                  <div className="modal-body space-y-10 text-left">
                      <div className="grid grid-cols-1 gap-4">
                         {(['Active', 'Under Repair', 'Disposed'] as any[]).map(cond => (
                            <button
                               key={cond}
                               onClick={() => {
                                  updateAssetCondition(selectedAssetId!, cond);
                                  setIsConditionModalOpen(false);
                                  showToast(`State transitioned to ${cond}.`);
                               }}
                               className={`flex items-center justify-between px-8 h-[72px] rounded-[12px] border-2 transition-all duration-300 shadow-sm group ${selectedAsset?.condition === cond
                                 ? 'border-amber-600 bg-amber-50 text-amber-900'
                                 : 'border-gray-100 bg-white text-gray-400 hover:border-amber-200 hover:bg-gray-50 hover:text-gray-600'
                                 }`}
                            >
                              <div className="flex flex-col text-left">
                                <span className={`text-[12px] font-bold tracking-[2px] uppercase ${selectedAsset?.condition === cond ? 'text-amber-700' : 'text-gray-400'}`}>Method</span>
                                <span className="text-[16px] font-bold uppercase tracking-tight">{cond}</span>
                              </div>
                              {selectedAsset?.condition === cond ? (
                                <CheckCircleIcon className="w-8 h-8 text-amber-600" />
                              ) : (
                                <div className="w-8 h-8 rounded-full border-2 border-gray-100 group-hover:border-amber-200"></div>
                              )}
                           </button>
                        ))}
                      </div>
                      <div className="p-8 bg-gray-50 rounded-[16px] border-2 border-dashed border-gray-200">
                         <InformationCircleIcon className="w-10 h-10 text-amber-500 shrink-0" />
                         <p className="text-[12px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide mt-3">
                            Status changes are saved for reports.
                         </p>
                      </div>
                  </div>

                  <div className="modal-footer flex gap-6 p-10">
                      <Button variant="secondary" className="w-full h-[56px] rounded-2xl font-bold uppercase tracking-widest shadow-md bg-white border-2" onClick={() => setIsConditionModalOpen(false)}>Discard</Button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
