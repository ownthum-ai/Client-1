"use client";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useStore, PropertyStatus, PropertyType } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { KPICard } from '@/components/ui/KPICard';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import {
  ArrowPathIcon,
  BuildingOffice2Icon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusIcon,
  RectangleGroupIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ChartBarIcon,
  SparklesIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

type PropertyTab = 'all' | 'available' | 'booked' | 'sold';
type DrawerTab = 'overview' | 'pricing' | 'documents';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const getPropertyDesc = (property: any) => {
  const parts: string[] = [];
  if (property.block) {
    const b = property.block.trim();
    parts.push(b.toLowerCase().startsWith('block') ? b : `Block ${b}`);
  }
  if (property.floor) {
    const f = property.floor.trim();
    parts.push(f.toLowerCase().includes('floor') ? f : `${f} Floor`);
  }
  if (property.bhk) {
    const bhk = property.bhk.trim();
    parts.push(bhk.toLowerCase().includes('bhk') ? bhk : `${bhk} BHK`);
  }
  return parts.join(', ');
};

const statusVariant = (status: PropertyStatus) => {
  if (status === 'Available') return 'success';
  if (status === 'Booked') return 'info';
  if (status === 'Sold') return 'gold';
  return 'warning';
};

const getStatusConfig = (status: PropertyStatus) => {
  switch (status) {
    case 'Available':
      return {
        bg: 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-100 hover:border-emerald-300',
        dot: 'bg-emerald-500 shadow-emerald-500/50',
        text: 'text-emerald-800',
        badge: 'text-emerald-700 bg-emerald-100',
        icon: CheckCircleIcon,
        glow: 'shadow-emerald-500/20',
        cell: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-600 text-white',
        cellGlow: '0 0 0 3px rgba(16,185,129,0.25)',
      };
    case 'Booked':
      return {
        bg: 'bg-blue-50/60 hover:bg-blue-50 border-blue-100 hover:border-blue-300',
        dot: 'bg-blue-500 shadow-blue-500/50',
        text: 'text-blue-800',
        badge: 'text-blue-700 bg-blue-100',
        icon: ClockIcon,
        glow: 'shadow-blue-500/20',
        cell: 'bg-blue-500 hover:bg-blue-400 border-blue-600 text-white',
        cellGlow: '0 0 0 3px rgba(59,130,246,0.25)',
      };
    case 'Sold':
      return {
        bg: 'bg-amber-50/60 hover:bg-amber-50 border-amber-100 hover:border-amber-300',
        dot: 'bg-amber-500 shadow-amber-500/50',
        text: 'text-amber-800',
        badge: 'text-amber-700 bg-amber-100',
        icon: FireIcon,
        glow: 'shadow-amber-500/20',
        cell: 'bg-amber-500 hover:bg-amber-400 border-amber-600 text-white',
        cellGlow: '0 0 0 3px rgba(245,158,11,0.25)',
      };
    default:
      return {
        bg: 'bg-rose-50/60 hover:bg-rose-50 border-rose-100 hover:border-rose-300',
        dot: 'bg-rose-500 shadow-rose-500/50',
        text: 'text-rose-800',
        badge: 'text-rose-700 bg-rose-100',
        icon: SparklesIcon,
        glow: 'shadow-rose-500/20',
        cell: 'bg-rose-400 hover:bg-rose-300 border-rose-500 text-white',
        cellGlow: '0 0 0 3px rgba(239,68,68,0.25)',
      };
  }
};

/* ─── Animated counter ─── */
function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 900;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{prefix}{display.toLocaleString('en-IN')}</>;
}

/* ─── Particle/shimmer bar ─── */
function StatusBar({ available, booked, sold, total }: { available: number; booked: number; sold: number; total: number }) {
  if (total === 0) return null;
  const av = (available / total) * 100;
  const bk = (booked / total) * 100;
  const sl = (sold / total) * 100;

  return (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden flex">
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${av}%` }} transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        className="h-full bg-emerald-400 rounded-l-full"
      />
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${bk}%` }} transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
        className="h-full bg-blue-400"
      />
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${sl}%` }} transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
        className="h-full bg-amber-400 rounded-r-full"
      />
    </div>
  );
}

/* ─── Plot-selection style cell ─── */
function SeatCell({ property, index, onClick }: { property: any; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const value = property.area * property.rate;
  const desc = getPropertyDesc(property);

  // Visual style: Available = white + border, others = filled
  const cellStyle = (() => {
    switch (property.status) {
      case 'Available': return 'bg-white border-2 border-gray-300 text-gray-800 hover:border-[var(--gold)] hover:bg-amber-50/30';
      case 'Booked':    return 'bg-blue-500 border-2 border-blue-600 text-white';
      case 'Sold':      return 'bg-[var(--gold)] border-2 border-[var(--gold-dk)] text-white';
      case 'Hold':      return 'bg-rose-500 border-2 border-rose-600 text-white';
      default:          return 'bg-gray-200 border-2 border-gray-300 text-gray-600';
    }
  })();

  const glowColor = (() => {
    switch (property.status) {
      case 'Available': return '0 0 0 3px rgba(201,150,59,0.3)';
      case 'Booked':    return '0 0 0 3px rgba(59,130,246,0.35)';
      case 'Sold':      return '0 0 0 3px rgba(201,150,59,0.35)';
      case 'Hold':      return '0 0 0 3px rgba(239,68,68,0.35)';
      default:          return 'none';
    }
  })();

  return (
    <div className="relative" style={{ zIndex: hovered ? 60 : 'auto' }}>
      <motion.button
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.16, delay: index * 0.012, type: 'spring', stiffness: 450, damping: 24 }}
        whileHover={{ scale: 1.12, y: -2 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onClick}
        style={hovered ? { boxShadow: glowColor } : { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        className={`relative w-[72px] h-[62px] rounded-xl cursor-pointer flex flex-col items-center justify-center gap-0.5 select-none transition-colors duration-150 ${cellStyle}`}
      >
        <span className={`text-[13px] font-black tracking-tight leading-none z-10 ${
          property.status === 'Available' ? 'text-gray-900' : 'text-white'
        }`}>
          {property.propertyNo}
        </span>
        <span className={`text-[8px] font-bold uppercase tracking-wider z-10 ${
          property.status === 'Available' ? 'text-gray-400' : 'text-white/70'
        }`}>
          {property.type}
        </span>
        {desc && (
          <span className={`text-[7px] font-bold truncate max-w-[66px] text-center z-10 ${
            property.status === 'Available' ? 'text-gray-400' : 'text-white/50'
          }`}>
            {desc}
          </span>
        )}
      </motion.button>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.94 }}
            transition={{ duration: 0.13 }}
            className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-[200] w-[200px] bg-gray-950 text-white rounded-xl shadow-2xl border border-white/10 p-3 pointer-events-none"
          >
            <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
              style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #030712' }} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-black tracking-tight uppercase">{property.propertyNo}</span>
              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                property.status === 'Available' ? 'bg-emerald-500/20 text-emerald-300' :
                property.status === 'Booked'    ? 'bg-blue-500/20 text-blue-300' :
                property.status === 'Sold'      ? 'bg-amber-500/20 text-amber-300' :
                                                  'bg-rose-500/20 text-rose-300'
              }`}>{property.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
              <div className="text-white/40 font-bold uppercase">Area</div>
              <div className="text-white font-bold tabular-nums">
                {property.area.toLocaleString('en-IN')} {property.type === 'Flat' || property.type === 'Shop' ? 'SqFt' : 'SqYd'}
              </div>
              <div className="text-white/40 font-bold uppercase">Facing</div>
              <div className="text-white font-bold">{property.facing}</div>
              {desc && <>
                <div className="text-white/40 font-bold uppercase">Details</div>
                <div className="text-white font-bold">{desc}</div>
              </>}
              {property.customerName && <>
                <div className="text-white/40 font-bold uppercase">Owner</div>
                <div className="text-white font-bold truncate">{property.customerName}</div>
              </>}
            </div>
            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
              <span className="text-[8px] text-white/30 font-bold uppercase">Value</span>
              <span className="text-[12px] font-black text-amber-300 tabular-nums">{formatCurrency(value)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Table row ─── */
function TableRow({ property, index, isSelected, onClick }: { property: any; index: number; isSelected: boolean; onClick: () => void }) {
  const value = property.area * property.rate;

  const typeConfig = (() => {
    switch (property.type as PropertyType) {
      case 'Plot':
        return {
          iconBg: 'bg-orange-50 text-orange-600 border-orange-100',
          Icon: MapPinIcon,
        };
      case 'Villa':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          Icon: HomeModernIcon,
        };
      case 'Flat':
        return {
          iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
          Icon: BuildingOffice2Icon,
        };
      case 'Shop':
        return {
          iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
          Icon: RectangleGroupIcon,
        };
      default:
        return {
          iconBg: 'bg-gray-50 text-gray-600 border-gray-100',
          Icon: HomeModernIcon,
        };
    }
  })();

  const TypeIcon = typeConfig.Icon;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onClick}
      className={`hover:bg-amber-50/30 cursor-pointer border-b border-[var(--border)] transition-colors duration-150 ${isSelected ? 'bg-amber-50/50' : ''}`}
    >
      <td className="p-[14px_24px]">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded border flex items-center justify-center shadow-sm ${typeConfig.iconBg}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-[14px] font-bold text-[var(--text)] tracking-tight uppercase">{property.propertyNo}</div>
            <div className="text-[10px] text-[var(--text3)] font-bold tracking-[1px] uppercase opacity-60">
              {property.type}{(() => { const d = getPropertyDesc(property); return d ? ` — ${d}` : ''; })()}
            </div>
          </div>
        </div>
      </td>
      <td className="p-[14px_15px]">
        <div className="text-[13px] font-bold text-[var(--text)]">{property.projectName}</div>
        {property.facing && (
          <div className="text-[10px] text-[var(--text3)] font-bold uppercase opacity-50 mt-1">{property.facing} facing</div>
        )}
      </td>
      <td className="p-[14px_15px]">
        <div className="text-[13px] font-bold text-[var(--text)] uppercase">{property.customerName || '—'}</div>
        {property.bookingDate && (
          <div className="text-[10px] text-[var(--text3)] font-bold uppercase opacity-50 mt-1">{property.bookingDate}</div>
        )}
      </td>
      <td className="p-[14px_15px] text-[13px] font-bold tabular-nums text-[var(--text2)]">
        {property.area.toLocaleString('en-IN')}{' '}
        {property.type === 'Flat' || property.type === 'Shop' ? 'SqFt' : 'SqYd'}
      </td>
      <td className="p-[14px_15px] text-right text-[14px] font-bold tabular-nums text-[var(--text)]">{formatCurrency(value)}</td>
      <td className="p-[14px_24px] text-right">
        <Badge variant={statusVariant(property.status)} className="shadow-sm text-[9px] font-bold">{property.status}</Badge>
      </td>
    </motion.tr>
  );
}

/* ═══════════════════════════ MAIN PAGE ═══════════════════════════ */
export default function PropertyPage() {
  const { properties = [], addProperty, addProperties, updatePropertyStatus, updateProperty } = useStore();
  const [activeTab, setActiveTab] = useState<PropertyTab>('all');
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('overview');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerCustomer, setDrawerCustomer] = useState('');
  const [drawerBookingDate, setDrawerBookingDate] = useState('');
  const [drawerNotes, setDrawerNotes] = useState('');
  const [bookingStatus, setBookingStatus] = useState<PropertyStatus>('Available');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('map');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | PropertyType>('all');
  const [collapsedTypes, setCollapsedTypes] = useState<Record<PropertyType, boolean>>({
    Plot: false,
    Villa: false,
    Flat: false,
    Shop: false,
  });
  const [collapsedTypeProjects, setCollapsedTypeProjects] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  const [form, setForm] = useState({
    propertyNo: '', projectName: '',
    type: 'Plot' as PropertyType,
    block: '',
    facing: 'East' as 'East' | 'West' | 'North' | 'South' | 'Corner',
    area: 0, rate: 0,
    status: 'Available' as PropertyStatus,
    customerName: '', bookingDate: '', notes: '', floor: '', bhk: ''
  });

  // ── Bulk Add State ──
  const [isBulk, setIsBulk] = useState(true);
  const [bulkForm, setBulkForm] = useState({
    projectName: '',
    type: 'Plot' as PropertyType,
    area: 0, rate: 0,
    facing: 'East' as 'East' | 'West' | 'North' | 'South' | 'Corner',
    unitPrefix: 'P',        // e.g. P → P-001, P-002
    totalUnits: 0,          // for Plot / Villa / Shop
    floors: 0,              // for Flat only
    unitsPerFloor: 0,       // for Flat only
    block: 'A',             // Wing for Flat
    bhk: '',                // for Flat / Villa
    startNumber: 1,
  });

  useEffect(() => { setMounted(true); }, []);

  const selectedProperty = useMemo(
    () => properties.find(p => p.id === selectedPropertyId),
    [properties, selectedPropertyId]
  );

  useEffect(() => {
    if (selectedProperty) {
      setDrawerCustomer(selectedProperty.customerName || '');
      setDrawerBookingDate(selectedProperty.bookingDate || '');
      setDrawerNotes(selectedProperty.notes || '');
      setBookingStatus(selectedProperty.status);
    } else {
      setDrawerCustomer(''); setDrawerBookingDate(''); setDrawerNotes(''); setBookingStatus('Available');
    }
  }, [selectedProperty]);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.propertyNo.toLowerCase().includes(term) ||
        p.projectName.toLowerCase().includes(term) ||
        p.block.toLowerCase().includes(term) ||
        (p.customerName || '').toLowerCase().includes(term);
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'available' && p.status === 'Available') ||
        (activeTab === 'booked' && p.status === 'Booked') ||
        (activeTab === 'sold' && p.status === 'Sold');
      return matchesSearch && matchesTab;
    });
  }, [activeTab, properties, searchTerm]);

  const stats = useMemo(() => {
    const inventoryValue = properties.reduce((t, p) => t + p.area * p.rate, 0);
    const soldValue = properties.filter(p => p.status === 'Sold').reduce((t, p) => t + p.area * p.rate, 0);
    return {
      total: properties.length,
      available: properties.filter(p => p.status === 'Available').length,
      booked: properties.filter(p => p.status === 'Booked').length,
      sold: properties.filter(p => p.status === 'Sold').length,
      hold: properties.filter(p => p.status === 'Hold').length,
      inventoryValue,
      soldValue,
    };
  }, [properties]);

  /* ── Single add ── */
  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    addProperty({
      ...form,
      customerName: form.status === 'Booked' || form.status === 'Sold' ? (form.customerName || undefined) : undefined,
      bookingDate: form.status === 'Booked' || form.status === 'Sold'
        ? (form.bookingDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))
        : undefined,
      notes: form.notes || undefined,
      block: form.type === 'Flat' ? form.block : '',
      floor: form.type === 'Flat' || form.type === 'Shop' ? form.floor : undefined,
      bhk: form.type === 'Flat' || form.type === 'Villa' ? form.bhk : undefined,
    });
    setIsAddModalOpen(false);
    setForm({ propertyNo: '', projectName: '', type: 'Plot', block: '', facing: 'East', area: 0, rate: 0, status: 'Available', customerName: '', bookingDate: '', notes: '', floor: '', bhk: '' });
  };

  /* ── Bulk add: generates all units automatically ── */
  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const b = bulkForm;
    if (!b.projectName || b.area <= 0 || b.rate <= 0) return;
    const units: Omit<typeof properties[0], 'id'>[] = [];
    const pad = (n: number, len = 3) => String(n).padStart(len, '0');

    if (b.type === 'Plot' || b.type === 'Villa' || b.type === 'Shop') {
      const prefix = b.unitPrefix || (b.type === 'Villa' ? 'V' : b.type === 'Shop' ? 'S' : 'P');
      for (let i = 0; i < b.totalUnits; i++) {
        units.push({
          propertyNo: `${prefix}-${pad(b.startNumber + i)}`,
          projectName: b.projectName,
          type: b.type,
          area: b.area, rate: b.rate,
          facing: b.facing,
          status: 'Available',
          block: '',
          bhk: b.type === 'Villa' ? b.bhk : undefined,
        });
      }
    } else if (b.type === 'Flat') {
      const wing = (b.block || 'A').toUpperCase();
      for (let f = 1; f <= b.floors; f++) {
        for (let u = 1; u <= b.unitsPerFloor; u++) {
          units.push({
            propertyNo: `${wing}${f}${pad(u, 2)}`,   // e.g. A101, A102, A201
            projectName: b.projectName,
            type: 'Flat',
            area: b.area, rate: b.rate,
            facing: b.facing,
            status: 'Available',
            block: wing,
            floor: String(f),
            bhk: b.bhk || undefined,
          });
        }
      }
    }

    if (units.length > 0) addProperties(units);
    setIsAddModalOpen(false);
    setBulkForm({ projectName: '', type: 'Plot', area: 0, rate: 0, facing: 'East', unitPrefix: 'P', totalUnits: 0, floors: 0, unitsPerFloor: 0, block: 'A', bhk: '', startNumber: 1 });
  };

  /* ── Preview of generated unit names ── */
  const previewUnits = useMemo(() => {
    const b = bulkForm;
    const pad = (n: number, len = 3) => String(n).padStart(len, '0');
    const preview: string[] = [];
    if (b.type === 'Flat') {
      const wing = (b.block || 'A').toUpperCase();
      for (let f = 1; f <= Math.min(b.floors, 3); f++) {
        for (let u = 1; u <= Math.min(b.unitsPerFloor, 4); u++) {
          preview.push(`${wing}${f}${pad(u, 2)}`);
        }
        if (b.unitsPerFloor > 4) preview.push('...');
      }
      if (b.floors > 3) preview.push('...');
    } else {
      const prefix = b.unitPrefix || (b.type === 'Villa' ? 'V' : b.type === 'Shop' ? 'S' : 'P');
      for (let i = 0; i < Math.min(b.totalUnits, 6); i++) {
        preview.push(`${prefix}-${pad(b.startNumber + i)}`);
      }
      if (b.totalUnits > 6) preview.push('...');
    }
    return preview;
  }, [bulkForm]);

  const totalBulkUnits = bulkForm.type === 'Flat'
    ? bulkForm.floors * bulkForm.unitsPerFloor
    : bulkForm.totalUnits;

  const handleStatusChange = (status: PropertyStatus) => {
    if (!selectedProperty) return;
    updatePropertyStatus(selectedProperty.id, status);
    setIsStatusModalOpen(false);
  };

  const openBooking = (id: string) => { setSelectedPropertyId(id); setIsBookingModalOpen(true); };
  const closeBooking = () => { setIsBookingModalOpen(false); setSelectedPropertyId(null); };


  /* ─── Group by project for map view ─── */
  const projectsMap = useMemo(() => {
    const map: Record<string, typeof filteredProperties> = {};
    filteredProperties.forEach(p => {
      if (!map[p.projectName]) map[p.projectName] = [];
      map[p.projectName].push(p);
    });
    return map;
  }, [filteredProperties]);

  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[var(--h1-fs)] font-bold text-[var(--text)] tracking-tight leading-tight uppercase">Property</h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm">Inventory</Badge>
              <span className="text-[13px] text-[var(--text3)] font-bold tracking-tight uppercase opacity-80">
                Manage stock · Booking · Sale status
              </span>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button v2={true} className="h-11 px-7 rounded-lg shadow-md shadow-amber-100" onClick={() => setIsAddModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </motion.div>
        </motion.div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Properties', value: stats.total, color: 'gold', trend: 'Listed', icon: BuildingOffice2Icon },
            { label: 'Available', value: stats.available, color: 'green', trend: 'Ready', icon: HomeModernIcon },
            { label: 'Booked', value: stats.booked, color: 'blue', trend: 'In process', icon: RectangleGroupIcon },
            { label: 'Inventory Value', value: formatCurrency(stats.inventoryValue), color: 'red', trend: `${formatCurrency(stats.soldValue)} sold`, icon: CurrencyRupeeIcon },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <KPICard
                label={item.label}
                value={item.value}
                color={item.color as any}
                trend={{ value: item.trend, type: 'neutral' }}
                icon={item.icon}
              />
            </motion.div>
          ))}
        </div>

        {/* ── Status progress bar ── */}
        {properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inventory Breakdown</span>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />Available {stats.available}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />Booked {stats.booked}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />Sold {stats.sold}</span>
                {stats.hold > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" />Hold {stats.hold}</span>}
              </div>
            </div>
            <StatusBar available={stats.available} booked={stats.booked} sold={stats.sold} total={stats.total} />
          </motion.div>
        )}

        {/* ── Main Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-0 overflow-hidden shadow-sm min-h-[560px]">

            {/* Toolbar */}
            <div className="p-6 border-b border-[var(--border)] bg-gray-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'available', label: 'Available' },
                  { id: 'booked', label: 'Booked' },
                  { id: 'sold', label: 'Sold' },
                ].map(tab => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveTab(tab.id as PropertyTab)}
                    className={`h-9 px-4 rounded-md border text-[10px] font-bold uppercase tracking-[1px] transition-none relative overflow-hidden ${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white text-[var(--text3)] border-[var(--border)] hover:text-[var(--text)]'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 bg-gray-900 rounded-md -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {tab.label}
                    {tab.id !== 'all' && (
                      <span className="ml-1.5 text-[9px] opacity-60">
                        {tab.id === 'available' ? stats.available : tab.id === 'booked' ? stats.booked : stats.sold}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                <div className="flex bg-gray-100 p-1 rounded-lg border border-[var(--border)] self-start sm:self-auto">
                  {(['table', 'map'] as const).map(mode => (
                    <motion.button
                      key={mode}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {mode === 'table' ? 'Table List' : 'Interactive Map'}
                    </motion.button>
                  ))}
                </div>
                {/* Type Selection Dropdown (selection wise filter) */}
                <div className="w-full sm:w-[150px]">
                  <Select
                    v2={true}
                    value={selectedTypeFilter}
                    onChange={e => setSelectedTypeFilter(e.target.value as any)}
                    className="h-10 rounded-lg shadow-sm text-[12px] font-bold uppercase"
                  >
                    <option value="all">All Types</option>
                    <option value="Plot">🟫 Plots</option>
                    <option value="Villa">🏡 Villas</option>
                    <option value="Flat">🏢 Flats</option>
                    <option value="Shop">🏪 Shops</option>
                  </Select>
                </div>
                <div className="relative w-full lg:w-[240px]">

                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input
                    v2={true}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search property..."
                    className="pl-10 h-10 rounded-lg shadow-sm text-[12px] font-bold"
                  />
                </div>
              </div>
            </div>

            {/* ── Table View ── */}
            <AnimatePresence mode="wait">
              {viewMode === 'table' ? (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-x-auto"
                >
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-[var(--border)]">
                        {['Property', 'Project', 'Customer', 'Area', 'Value', 'Status'].map((h, i) => (
                          <th key={h} className={`p-[13px_${i === 0 || i === 5 ? '24' : '15'}px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase ${i >= 4 ? 'text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.length === 0 || !filteredProperties.some(p => selectedTypeFilter === 'all' || p.type === selectedTypeFilter) ? (
                        <tr>
                          <td colSpan={6} className="p-16 text-center">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex flex-col items-center text-[var(--text3)] opacity-50"
                            >
                              <div className="w-12 h-12 mb-4 flex items-center justify-center">
                                <BuildingOffice2Icon className="w-12 h-12" />
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-[2px]">No property records found</span>
                            </motion.div>
                          </td>
                        </tr>
                      ) : (
                        (['Plot', 'Villa', 'Flat', 'Shop'] as PropertyType[]).map(propType => {
                          if (selectedTypeFilter !== 'all' && selectedTypeFilter !== propType) return null;

                          const typeProps = filteredProperties.filter(p => p.type === propType);
                          if (typeProps.length === 0) return null;

                          const isCollapsed = collapsedTypes[propType];

                          const typeIcon = {
                            Plot: '🟫', Villa: '🏡', Flat: '🏢', Shop: '🏪'
                          }[propType] || '🏠';

                          // Group by project name for this property type
                          const projectsGroup: Record<string, typeof typeProps> = {};
                          typeProps.forEach(p => {
                            if (!projectsGroup[p.projectName]) projectsGroup[p.projectName] = [];
                            projectsGroup[p.projectName].push(p);
                          });

                          return (
                            <React.Fragment key={propType}>
                              {/* Section Header Row — Collapsible */}
                              <tr
                                onClick={() => setCollapsedTypes(prev => ({ ...prev, [propType]: !prev[propType] }))}
                                className="bg-amber-50/20 border-y border-[var(--border)] select-none cursor-pointer hover:bg-amber-50/40 transition-colors"
                              >
                                <td colSpan={6} className="p-[11px_24px]">
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-[12px] leading-none">{typeIcon}</span>
                                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-[1.5px]">
                                        {propType}s ({typeProps.length})
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge variant="neutral" className="text-[9px] font-bold px-2 py-0.5 bg-amber-100/50 text-amber-800 border-none">
                                        {isCollapsed ? 'COLLAPSED' : 'EXPANDED'}
                                      </Badge>
                                      {isCollapsed ? (
                                        <ChevronRightIcon className="w-4 h-4 text-amber-700 shrink-0" />
                                      ) : (
                                        <ChevronDownIcon className="w-4 h-4 text-amber-700 shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              {/* Grouped project list inside the type */}
                              {!isCollapsed && Object.entries(projectsGroup).map(([projName, projProps]) => {
                                const projKey = `${propType}-${projName}`;
                                const isProjCollapsed = collapsedTypeProjects[projKey] || false;

                                return (
                                  <React.Fragment key={projName}>
                                    {/* Project Sub-header Row — Collapsible */}
                                    <tr
                                      onClick={() => setCollapsedTypeProjects(prev => ({ ...prev, [projKey]: !prev[projKey] }))}
                                      className="bg-gray-50/50 border-b border-[var(--border)] select-none cursor-pointer hover:bg-gray-100/50 transition-colors"
                                    >
                                      <td colSpan={6} className="p-[8px_36px]">
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[12px] leading-none">📁</span>
                                            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                                              {projName} ({projProps.length} units)
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2.5">
                                            <Badge variant="neutral" className="text-[8px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 border-none">
                                              {isProjCollapsed ? 'COLLAPSED' : 'EXPANDED'}
                                            </Badge>
                                            {isProjCollapsed ? (
                                              <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            ) : (
                                              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                    {/* Data Rows under this project */}
                                    {!isProjCollapsed && projProps.map((p, i) => (
                                      <TableRow
                                        key={p.id}
                                        property={p}
                                        index={i}
                                        isSelected={selectedPropertyId === p.id}
                                        onClick={() => openBooking(p.id)}
                                      />
                                    ))}
                                  </React.Fragment>
                                );
                              })}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </motion.div>
              ) : (
                /* ── Inventory Grid — Project → Type ── */
                <motion.div
                  key="map"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col"
                >
                  {/* Global Legend */}
                  <div className="px-6 py-3 border-b border-[var(--border)] bg-[#FAFAF8] flex flex-wrap items-center gap-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[1.5px]">Legend</span>
                    <span className="flex items-center gap-2 text-[10px] font-bold text-gray-700 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-lg border-2 border-gray-300 bg-white inline-block shadow-sm" />
                      Available
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-lg bg-blue-500 inline-block shadow-sm" />
                      Booked
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-lg bg-[var(--gold)] inline-block shadow-sm" />
                      Sold
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-bold text-rose-700 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-lg bg-rose-500 inline-block shadow-sm" />
                      Hold
                    </span>
                    <span className="ml-auto text-[9px] font-bold text-gray-300 uppercase tracking-wider hidden sm:block">
                      Hover for details · Click to manage
                    </span>
                  </div>

                  {/* Projects */}
                  <div className="divide-y divide-gray-100">
                    {Object.keys(projectsMap).length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center p-20 text-gray-300"
                      >
                        <div className="w-14 h-14 mb-4 flex items-center justify-center">
                          <BuildingOffice2Icon className="w-14 h-14" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-[2px]">No properties found</span>
                      </motion.div>
                    ) : (
                      Object.entries(projectsMap).map(([projectName, allProps], gi) => {
                        // Group by type within this project
                        const typeOrder: PropertyType[] = ['Plot', 'Villa', 'Flat', 'Shop'];
                        const byType: Partial<Record<PropertyType, typeof allProps>> = {};
                        allProps.forEach(p => {
                          if (!byType[p.type]) byType[p.type] = [];
                          byType[p.type]!.push(p);
                        });
                        const typesPresent = typeOrder.filter(t => byType[t] && byType[t]!.length > 0);

                        const projectAvail = allProps.filter(p => p.status === 'Available').length;
                        const projectTotal = allProps.length;

                        return (
                          <motion.div
                            key={projectName}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: gi * 0.1 }}
                          >
                            {/* ── Project header ── */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/60">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[var(--gold)] rounded-xl flex items-center justify-center shadow-md">
                                  <BuildingOffice2Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-[16px] font-black text-gray-900 uppercase tracking-widest leading-none">
                                    {projectName}
                                  </h3>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {projectTotal} units · {projectAvail} available
                                  </span>
                                </div>
                              </div>
                              <div className="hidden sm:flex items-center gap-2">
                                {typesPresent.map(t => (
                                  <span key={t} className="text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full border border-gray-200">
                                    {byType[t]!.length} {t}{byType[t]!.length > 1 ? 's' : ''}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* ── Type sections inside project ── */}
                            <div className="divide-y divide-gray-50">
                              {typesPresent.map((propType, ti) => {
                                const typeProps = byType[propType]!;
                                const typeAvail = typeProps.filter(p => p.status === 'Available').length;
                                const typeBooked = typeProps.filter(p => p.status === 'Booked').length;
                                const typeSold = typeProps.filter(p => p.status === 'Sold').length;
                                const typeHold = typeProps.filter(p => p.status === 'Hold').length;
                                const typeTotal = typeProps.length;

                                const typeIcon = {
                                  Plot: '🟫', Villa: '🏡', Flat: '🏢', Shop: '🏪'
                                }[propType] || '🏠';

                                return (
                                  <motion.div
                                    key={propType}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: gi * 0.1 + ti * 0.07 }}
                                    className="p-6"
                                  >
                                    {/* Type header */}
                                    <div className="flex items-center justify-between mb-5">
                                      <div className="text-left">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[18px] leading-none">{typeIcon}</span>
                                          <h4 className="text-[14px] font-black text-gray-900 tracking-[2px] uppercase">
                                            SELECT {propType}
                                          </h4>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-7">
                                          Interactive {propType} Management
                                        </p>
                                      </div>
                                      {/* Type legend pills */}
                                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5 text-gray-500">
                                          <span className="w-3 h-3 rounded border-2 border-gray-300 bg-white inline-block" />
                                          {typeAvail}
                                        </span>
                                        {typeBooked > 0 && (
                                          <span className="flex items-center gap-1.5 text-blue-600">
                                            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                                            {typeBooked}
                                          </span>
                                        )}
                                        {typeSold > 0 && (
                                          <span className="flex items-center gap-1.5 text-amber-600">
                                            <span className="w-3 h-3 rounded bg-[var(--gold)] inline-block" />
                                            {typeSold}
                                          </span>
                                        )}
                                        {typeHold > 0 && (
                                          <span className="flex items-center gap-1.5 text-rose-600">
                                            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
                                            {typeHold}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden flex mb-5">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${(typeAvail/typeTotal)*100}%` }} transition={{ duration: 0.8, delay: ti*0.08+0.2, ease:'easeOut' }} className="h-full bg-gray-300" />
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${(typeBooked/typeTotal)*100}%` }} transition={{ duration: 0.8, delay: ti*0.08+0.35, ease:'easeOut' }} className="h-full bg-blue-400" />
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${(typeSold/typeTotal)*100}%` }} transition={{ duration: 0.8, delay: ti*0.08+0.5, ease:'easeOut' }} className="h-full bg-amber-400" />
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${(typeHold/typeTotal)*100}%` }} transition={{ duration: 0.8, delay: ti*0.08+0.65, ease:'easeOut' }} className="h-full bg-rose-400 rounded-r-full" />
                                    </div>

                                    {/* THE GRID — multi-row, 10 per row */}
                                    <div
                                      className="flex flex-wrap gap-2"
                                      style={{ alignItems: 'flex-start' }}
                                    >
                                      {typeProps.map((p, ci) => (
                                        <SeatCell
                                          key={p.id}
                                          property={p}
                                          index={gi * 30 + ti * 10 + ci}
                                          onClick={() => openBooking(p.id)}
                                        />
                                      ))}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════ BOOKING MODAL ═══════════════════════════ */}
      <AnimatePresence>
        {isBookingModalOpen && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="modal-container max-w-4xl shadow-2xl"
            >
              <div className="modal-header">
                <div className="flex items-center gap-6 text-left">
                  <div className="modal-header-icon text-amber-600">
                    <HomeModernIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">
                      Booking &amp; Allotment Details
                    </h2>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">
                      {selectedProperty.propertyNo} — {selectedProperty.type} · {selectedProperty.projectName}
                    </p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button variant="secondary" size="icon" className="rounded-xl border-2 h-10 w-10 shadow-sm" onClick={closeBooking}>
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (bookingStatus !== selectedProperty.status) {
                    updatePropertyStatus(selectedProperty.id, bookingStatus, drawerCustomer || undefined);
                  }
                  updateProperty(selectedProperty.id, {
                    customerName: (bookingStatus === 'Booked' || bookingStatus === 'Sold') ? (drawerCustomer || undefined) : undefined,
                    bookingDate: (bookingStatus === 'Booked' || bookingStatus === 'Sold') ? (drawerBookingDate || undefined) : undefined,
                    notes: drawerNotes || undefined,
                  });
                  closeBooking();
                }}
                className="modal-body space-y-6 text-left"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Property Specs */}
                  <div className="space-y-4 border-r border-gray-100 pr-0 md:pr-8">
                    <h3 className="text-[12px] font-bold text-amber-600 tracking-[1.5px] uppercase border-b pb-2 mb-2">
                      Property Specifications
                    </h3>

                    {/* Status badge pill */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${getStatusConfig(selectedProperty.status).badge}`}
                    >
                      <span className={`w-2 h-2 rounded-full animate-pulse ${getStatusConfig(selectedProperty.status).dot}`} />
                      {selectedProperty.status}
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Property No', value: selectedProperty.propertyNo },
                        { label: 'Project', value: selectedProperty.projectName },
                      ].map(item => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-inner"
                        >
                          <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">{item.label}</span>
                          <span className="text-[14px] font-bold text-gray-900 uppercase truncate block">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: (selectedProperty.type === 'Flat' || selectedProperty.type === 'Shop') ? 'Area (SqFt)' : 'Area (SqYd)', value: selectedProperty.area.toLocaleString('en-IN') },
                        { label: selectedProperty.type === 'Plot' ? 'Rate per SqYd' : 'Rate / Total Price', value: formatCurrency(selectedProperty.rate), accent: true },
                      ].map(item => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-inner"
                        >
                          <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">{item.label}</span>
                          <span className={`text-[14px] font-bold tabular-nums ${(item as any).accent ? 'text-amber-600' : 'text-gray-900'}`}>{item.value}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Facing', value: `${selectedProperty.facing} Facing` },
                        { label: 'Type', value: selectedProperty.type },
                      ].map(item => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-inner"
                        >
                          <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">{item.label}</span>
                          <span className="text-[14px] font-bold text-gray-900 uppercase">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Type-specific extras */}
                    {(selectedProperty.type === 'Flat' || selectedProperty.type === 'Villa' || selectedProperty.type === 'Shop') && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 space-y-2"
                      >
                        <span className="text-[10px] font-bold text-amber-700 uppercase block tracking-widest mb-1.5">Location &amp; Sizing</span>
                        <div className="grid grid-cols-2 gap-2 text-[12px] font-bold uppercase text-gray-700">
                          {selectedProperty.type === 'Flat' && (
                            <>
                              <div>Block/Wing: <span className="text-gray-900">{selectedProperty.block || '—'}</span></div>
                              <div>Floor: <span className="text-gray-900">{selectedProperty.floor || '—'}</span></div>
                              <div>BHK: <span className="text-gray-900">{selectedProperty.bhk || '—'}</span></div>
                            </>
                          )}
                          {selectedProperty.type === 'Villa' && (
                            <div>BHK: <span className="text-gray-900">{selectedProperty.bhk || '—'}</span></div>
                          )}
                          {selectedProperty.type === 'Shop' && (
                            <div>Floor: <span className="text-gray-900">{selectedProperty.floor || '—'}</span></div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Total value highlight */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gray-900 rounded-xl text-white shadow-xl"
                    >
                      <p className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase mb-1">Total valuation</p>
                      <p className="text-[22px] font-bold leading-none tabular-nums">{formatCurrency(selectedProperty.area * selectedProperty.rate)}</p>
                    </motion.div>
                  </div>

                  {/* Right Column: Customer & Allotment */}
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold text-amber-600 tracking-[1.5px] uppercase border-b pb-2 mb-2">
                      Customer &amp; Allotment Details
                    </h3>

                    <div className="space-y-2">
                      <Label required>Property Status</Label>
                      <Select
                        v2={true}
                        value={bookingStatus}
                        onChange={e => setBookingStatus(e.target.value as PropertyStatus)}
                        className="h-11 shadow-md rounded-xl font-bold uppercase"
                      >
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Sold">Sold</option>
                        <option value="Hold">Hold</option>
                      </Select>
                    </div>

                    <AnimatePresence>
                      {(bookingStatus === 'Booked' || bookingStatus === 'Sold') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <Label required>Customer Name</Label>
                            <Input
                              required
                              v2={true}
                              value={drawerCustomer}
                              onChange={e => setDrawerCustomer(e.target.value)}
                              placeholder="Enter customer name"
                              className="h-11 shadow-md rounded-xl font-bold uppercase"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Booking Date</Label>
                            <Input
                              v2={true}
                              value={drawerBookingDate}
                              onChange={e => setDrawerBookingDate(e.target.value)}
                              placeholder="e.g. 30 May 2026"
                              className="h-11 shadow-md rounded-xl font-bold uppercase"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <Label>Notes / Remarks</Label>
                      <Input
                        v2={true}
                        value={drawerNotes}
                        onChange={e => setDrawerNotes(e.target.value)}
                        placeholder="Booking terms, registry, premium location"
                        className="h-11 shadow-md rounded-xl font-bold uppercase"
                      />
                    </div>

                    {/* Info card */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex flex-col gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100"
                    >
                      <div className="flex items-start gap-3">
                        <ShieldCheckIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800 font-bold uppercase tracking-wide leading-relaxed">
                          Saving booking details will automatically sync with the Property Holder &amp; Payment records.
                        </p>
                      </div>
                      {(selectedProperty.status === 'Booked' || selectedProperty.status === 'Sold' || bookingStatus === 'Booked' || bookingStatus === 'Sold') && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { closeBooking(); router.push('/propertyholder'); }}
                          className="self-start flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors duration-150"
                        >
                          <DocumentTextIcon className="w-3.5 h-3.5" />
                          View Property Holder &amp; Payments →
                        </motion.button>
                      )}
                    </motion.div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
                    <Button type="button" variant="secondary" className="w-full h-12 rounded-lg font-bold uppercase tracking-wider text-[11px]" onClick={closeBooking}>
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-[2]">
                    <Button type="submit" className="w-full h-12 rounded-lg font-bold uppercase tracking-wider text-[11px] shadow-lg">
                      Save Booking Details
                    </Button>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════ ADD PROPERTY MODAL ═══════════════════════════ */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="modal-container max-w-3xl shadow-2xl"
            >
              {/* Header */}
              <div className="modal-header">
                <div className="flex items-center gap-4 text-left">
                  <div className="modal-header-icon text-amber-600">
                    <PlusIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-[20px] font-black text-gray-900 tracking-tight uppercase leading-none mb-1">
                      Add Property Units
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
                      Bulk or single unit creation
                    </p>
                  </div>
                </div>
                {/* Mode toggle */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setIsBulk(true)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 ${
                        isBulk ? 'bg-[var(--gold)] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >⚡ Bulk</button>
                    <button
                      type="button"
                      onClick={() => setIsBulk(false)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 ${
                        !isBulk ? 'bg-[var(--gold)] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >Single</button>
                  </div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="secondary" size="icon" className="rounded-xl border-2 h-10 w-10 shadow-sm" onClick={() => setIsAddModalOpen(false)}>
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isBulk ? (
                  /* ── BULK MODE ── */
                  <motion.form
                    key="bulk"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleBulkAdd}
                    className="modal-body space-y-6 text-left"
                  >
                    {/* Row 1: Project + Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label required>Project Name</Label>
                        <Input required v2={true} value={bulkForm.projectName}
                          onChange={e => setBulkForm({ ...bulkForm, projectName: e.target.value })}
                          placeholder="e.g. Green Valley" className="h-11 rounded-xl font-bold uppercase" />
                      </div>
                      <div className="space-y-2">
                        <Label required>Property Type</Label>
                        <Select v2={true} value={bulkForm.type}
                          onChange={e => {
                            const t = e.target.value as PropertyType;
                            const prefix = t === 'Villa' ? 'V' : t === 'Shop' ? 'S' : t === 'Flat' ? 'A' : 'P';
                            setBulkForm({ ...bulkForm, type: t, unitPrefix: prefix });
                          }}
                          className="h-11 rounded-xl font-bold uppercase">
                          <option value="Plot">🟫 Plot</option>
                          <option value="Villa">🏡 Villa</option>
                          <option value="Flat">🏢 Flat</option>
                          <option value="Shop">🏪 Shop</option>
                        </Select>
                      </div>
                    </div>

                    {/* Row 2: Area + Rate */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label required>{(bulkForm.type === 'Flat' || bulkForm.type === 'Shop') ? 'Area per Unit (SqFt)' : 'Area per Unit (SqYd)'}</Label>
                        <Input required v2={true} type="number" value={bulkForm.area || ''}
                          onChange={e => setBulkForm({ ...bulkForm, area: Number(e.target.value) })}
                          placeholder="0" className="h-11 rounded-xl font-bold tabular-nums" />
                      </div>
                      <div className="space-y-2">
                        <Label required>{bulkForm.type === 'Plot' ? 'Rate per SqYd (₹)' : 'Rate / Price per Unit (₹)'}</Label>
                        <Input required v2={true} type="number" value={bulkForm.rate || ''}
                          onChange={e => setBulkForm({ ...bulkForm, rate: Number(e.target.value) })}
                          placeholder="0" className="h-11 rounded-xl font-bold text-amber-600 tabular-nums" />
                      </div>
                    </div>

                    {/* BHK for Villa / Flat */}
                    <AnimatePresence>
                      {(bulkForm.type === 'Flat' || bulkForm.type === 'Villa') && (
                        <motion.div
                          key="bhk"
                          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="space-y-2">
                            <Label>BHK Configuration</Label>
                            <Input v2={true} value={bulkForm.bhk}
                              onChange={e => setBulkForm({ ...bulkForm, bhk: e.target.value })}
                              placeholder="e.g. 3 BHK" className="h-11 rounded-xl font-bold uppercase" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Type-specific bulk fields ── */}
                    <AnimatePresence mode="wait">
                      {bulkForm.type !== 'Flat' ? (
                        /* Plot / Villa / Shop */
                        <motion.div
                          key="simple-bulk"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-4"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[18px]">{bulkForm.type === 'Villa' ? '🏡' : bulkForm.type === 'Shop' ? '🏪' : '🟫'}</span>
                            <span className="text-[12px] font-black text-blue-700 uppercase tracking-[2px]">
                              {bulkForm.type} Unit Configuration
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label required>How many {bulkForm.type}s?</Label>
                              <Input required v2={true} type="number" min="1" value={bulkForm.totalUnits || ''}
                                onChange={e => setBulkForm({ ...bulkForm, totalUnits: Number(e.target.value) })}
                                placeholder="e.g. 50" className="h-11 rounded-xl font-black text-blue-700 tabular-nums text-center text-[18px]" />
                            </div>
                            <div className="space-y-2">
                              <Label>Unit Prefix</Label>
                              <Input v2={true} value={bulkForm.unitPrefix}
                                onChange={e => setBulkForm({ ...bulkForm, unitPrefix: e.target.value.toUpperCase() })}
                                placeholder="P" maxLength={3} className="h-11 rounded-xl font-black text-center text-[16px] uppercase" />
                            </div>
                            <div className="space-y-2">
                              <Label>Start Number</Label>
                              <Input v2={true} type="number" min="1" value={bulkForm.startNumber}
                                onChange={e => setBulkForm({ ...bulkForm, startNumber: Number(e.target.value) })}
                                className="h-11 rounded-xl font-black tabular-nums text-center" />
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        /* Flat — Floor-wise */
                        <motion.div
                          key="flat-bulk"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="p-5 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-4"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[18px]">🏢</span>
                            <span className="text-[12px] font-black text-emerald-700 uppercase tracking-[2px]">
                              Flat Floor-wise Configuration
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label required>Wing / Block</Label>
                              <Input required v2={true} value={bulkForm.block}
                                onChange={e => setBulkForm({ ...bulkForm, block: e.target.value.toUpperCase() })}
                                placeholder="A" maxLength={3} className="h-11 rounded-xl font-black text-center text-[16px] uppercase" />
                            </div>
                            <div className="space-y-2">
                              <Label required>Number of Floors</Label>
                              <Input required v2={true} type="number" min="1" value={bulkForm.floors || ''}
                                onChange={e => setBulkForm({ ...bulkForm, floors: Number(e.target.value) })}
                                placeholder="e.g. 10" className="h-11 rounded-xl font-black text-emerald-700 tabular-nums text-center text-[18px]" />
                            </div>
                            <div className="space-y-2">
                              <Label required>Homes per Floor</Label>
                              <Input required v2={true} type="number" min="1" value={bulkForm.unitsPerFloor || ''}
                                onChange={e => setBulkForm({ ...bulkForm, unitsPerFloor: Number(e.target.value) })}
                                placeholder="e.g. 4" className="h-11 rounded-xl font-black text-emerald-700 tabular-nums text-center text-[18px]" />
                            </div>
                          </div>
                          {bulkForm.floors > 0 && bulkForm.unitsPerFloor > 0 && (
                            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider text-center">
                              Floor numbering: {bulkForm.block || 'A'}1{String(1).padStart(2,'0')} → {bulkForm.block || 'A'}{bulkForm.floors}{String(bulkForm.unitsPerFloor).padStart(2,'0')}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Live Preview ── */}
                    <AnimatePresence>
                      {previewUnits.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-gray-900 rounded-2xl">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-[2px]">
                                Preview — Unit Numbers Generated
                              </span>
                              <motion.span
                                key={totalBulkUnits}
                                initial={{ scale: 1.3, color: '#f59e0b' }}
                                animate={{ scale: 1, color: '#10b981' }}
                                className="text-[11px] font-black uppercase tracking-wider"
                              >
                                {totalBulkUnits} UNITS TOTAL
                              </motion.span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {previewUnits.map((u, i) => (
                                <motion.span
                                  key={u + i}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.04 }}
                                  className={`text-[10px] font-black px-2 py-1 rounded-lg border ${
                                    u === '...'
                                      ? 'bg-white/5 border-white/10 text-white/30'
                                      : 'bg-white/10 border-white/20 text-white'
                                  }`}
                                >
                                  {u}
                                </motion.span>
                              ))}
                            </div>
                            {totalBulkUnits > 0 && (
                              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[9px] font-bold text-white/30 uppercase tracking-wider">
                                <span>Total Value</span>
                                <span className="text-amber-300 text-[11px] font-black">{formatCurrency(totalBulkUnits * bulkForm.area * bulkForm.rate)}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-2 flex gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
                        <Button type="button" variant="secondary" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px]" onClick={() => setIsAddModalOpen(false)}>
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-[2]">
                        <Button
                          type="submit"
                          disabled={totalBulkUnits === 0 || !bulkForm.projectName || bulkForm.area <= 0 || bulkForm.rate <= 0}
                          className="w-full h-12 rounded-xl font-bold uppercase tracking-widest shadow-xl text-[11px] disabled:opacity-40"
                        >
                          ⚡ Generate {totalBulkUnits > 0 ? `${totalBulkUnits} Units` : 'Units'}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.form>
                ) : (
                  /* ── SINGLE MODE ── */
                  <motion.form
                    key="single"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleAddProperty}
                    className="modal-body space-y-6 text-left"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label required>Property Number</Label>
                        <Input required v2={true} value={form.propertyNo} onChange={e => setForm({ ...form, propertyNo: e.target.value })} placeholder="e.g. A-101" className="h-11 rounded-xl font-bold uppercase" />
                      </div>
                      <div className="space-y-2"><Label required>Project Name</Label>
                        <Input required v2={true} value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} placeholder="e.g. Green Valley" className="h-11 rounded-xl font-bold uppercase" />
                      </div>
                      <div className="space-y-2"><Label required>Type</Label>
                        <Select v2={true} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as PropertyType })} className="h-11 rounded-xl font-bold uppercase">
                          <option value="Plot">Plot</option><option value="Villa">Villa</option>
                          <option value="Flat">Flat</option><option value="Shop">Shop</option>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label required>{(form.type === 'Flat' || form.type === 'Shop') ? 'Area (SqFt)' : 'Area (SqYd)'}</Label>
                        <Input required v2={true} type="number" value={form.area || ''} onChange={e => setForm({ ...form, area: Number(e.target.value) })} placeholder="0" className="h-11 rounded-xl font-bold" />
                      </div>
                      <div className="space-y-2"><Label required>Rate (₹)</Label>
                        <Input required v2={true} type="number" value={form.rate || ''} onChange={e => setForm({ ...form, rate: Number(e.target.value) })} placeholder="0" className="h-11 rounded-xl font-bold text-amber-600" />
                      </div>

                      <div className="space-y-2"><Label required>Status</Label>
                        <Select v2={true} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as PropertyStatus })} className="h-11 rounded-xl font-bold uppercase">
                          <option value="Available">Available</option><option value="Booked">Booked</option>
                          <option value="Sold">Sold</option><option value="Hold">Hold</option>
                        </Select>
                      </div>
                      <AnimatePresence>
                        {form.type === 'Flat' && (
                          <motion.div key="blk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            <Label>Block / Wing</Label>
                            <Input v2={true} value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} placeholder="A" className="h-11 rounded-xl font-bold uppercase" />
                          </motion.div>
                        )}
                        {(form.type === 'Flat' || form.type === 'Shop') && (
                          <motion.div key="flr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            <Label>Floor</Label>
                            <Input v2={true} value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} placeholder="e.g. 3" className="h-11 rounded-xl font-bold uppercase" />
                          </motion.div>
                        )}
                        {(form.type === 'Flat' || form.type === 'Villa') && (
                          <motion.div key="bhk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                            <Label>BHK</Label>
                            <Input v2={true} value={form.bhk} onChange={e => setForm({ ...form, bhk: e.target.value })} placeholder="e.g. 3 BHK" className="h-11 rounded-xl font-bold uppercase" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="pt-2 flex gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
                        <Button type="button" variant="secondary" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px]" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-[2]">
                        <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest shadow-xl text-[11px]">Save Property</Button>
                      </motion.div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════ STATUS MODAL ═══════════════════════════ */}
      <AnimatePresence>
        {isStatusModalOpen && selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="modal-container max-w-lg shadow-2xl"
            >
              <div className="modal-header">
                <div className="flex items-center gap-6 text-left">
                  <div className="modal-header-icon text-amber-600">
                    <ArrowPathIcon className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Property Status</h2>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">{selectedProperty.propertyNo}</p>
                  </div>
                </div>
                <Button variant="secondary" size="icon" className="rounded-xl border-2 h-10 w-10 shadow-sm" onClick={() => setIsStatusModalOpen(false)}>
                  <XMarkIcon className="w-4 h-4" />
                </Button>
              </div>
              <div className="modal-body space-y-5 text-left">
                <div className="grid grid-cols-1 gap-3">
                  {(['Available', 'Booked', 'Sold', 'Hold'] as PropertyStatus[]).map((status, i) => (
                    <motion.button
                      key={status}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleStatusChange(status)}
                      className={`h-[58px] px-5 rounded-lg border-2 flex items-center justify-between transition-none ${
                        selectedProperty.status === status
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusConfig(status).dot}`} />
                        <span className="text-[13px] font-bold uppercase tracking-wider">{status}</span>
                      </div>
                      <Badge variant={statusVariant(status)}>{status === selectedProperty.status ? 'Current' : 'Set'}</Badge>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
