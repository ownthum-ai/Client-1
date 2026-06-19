"use client";
import React, { useMemo, useState } from 'react';
import { useStore, LabourAgency, LabourCategory, LabourStatus } from '@/store/useStore';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { KPICard } from '@/components/ui/KPICard';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import {
  ArrowPathIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  PlusIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

type LabourTab = 'all' | 'rcc' | 'plumbing' | 'electrical' | 'finishing' | 'services';
type DrawerTab = 'summary' | 'payment' | 'scope';
type RateType = LabourAgency['rateType'];
type QualityRating = LabourAgency['qualityRating'];

const labourCategories: LabourCategory[] = [
  'RCC Contractor',
  'Plumbing Agency',
  'Electrical Labour',
  'Masonry',
  'Tiles Labour',
  'Window & Section Labour',
  'Fire Labour',
  'Lift Material + Installation',
  'Color Labour',
  'POP / Gypsum',
  'Fabrication',
  'Other'
];

const statusOptions: LabourStatus[] = ['Active', 'On Hold', 'Completed', 'Inactive'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const statusVariant = (status: LabourStatus): BadgeVariant => {
  if (status === 'Active') return 'success';
  if (status === 'Completed') return 'info';
  if (status === 'On Hold') return 'warning';
  return 'neutral';
};

const qualityVariant = (quality: QualityRating): BadgeVariant => {
  if (quality === 'Good') return 'success';
  if (quality === 'Average') return 'warning';
  return 'danger';
};

const categoryToTab = (category: LabourCategory): LabourTab => {
  if (category === 'RCC Contractor' || category === 'Masonry') return 'rcc';
  if (category === 'Plumbing Agency') return 'plumbing';
  if (category === 'Electrical Labour') return 'electrical';
  if (category === 'Tiles Labour' || category === 'Window & Section Labour' || category === 'Color Labour' || category === 'POP / Gypsum' || category === 'Fabrication') return 'finishing';
  if (category === 'Fire Labour' || category === 'Lift Material + Installation') return 'services';
  return 'all';
};

const emptyForm = {
  agencyName: '',
  category: '' as LabourCategory,
  contactPerson: '',
  phone: '',
  assignedSite: '',
  supervisorName: '',
  workerCount: 0,
  rateType: 'Contract' as RateType,
  rate: 0,
  totalContract: 0,
  paidAmount: 0,
  startDate: new Date().toISOString().split('T')[0],
  nextPaymentDate: new Date().toISOString().split('T')[0],
  status: 'Active' as LabourStatus,
  qualityRating: 'Good' as QualityRating,
  notes: ''
};

const renderDetailsForCategory = (agency: LabourAgency) => {
  const details = agency.details || {};
  const renderRow = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 text-left">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-[13px] font-bold text-gray-900 uppercase text-right ml-4">
          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
        </span>
      </div>
    );
  };

  const formatRateVal = (val: any, suffix = '') => {
    if (val === undefined || val === null || val === '') return null;
    return `₹${val}${suffix}`;
  };

  switch (agency.category) {
    case 'RCC Contractor':
      return (
        <div className="space-y-1">
          {renderRow('Contractor Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Company Name', details.companyName)}
          {renderRow('Experience (Years)', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('RCC Rate', formatRateVal(details.rccRate, ' / sqft'))}
          {renderRow('Shuttering Rate', formatRateVal(details.shutteringRate, ' / sqft'))}
          {renderRow('Steel Binding Rate', formatRateVal(details.steelBindingRate, ' / kg'))}
          {renderRow('Labour Only / Labour + Material', details.contractType)}
          {renderRow('Areas Served', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Plumbing Agency':
      return (
        <div className="space-y-1">
          {renderRow('Agency Name', agency.agencyName)}
          {renderRow('Contact Person', agency.contactPerson)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('Internal Plumbing', details.internalPlumbing)}
          {renderRow('External Plumbing', details.externalPlumbing)}
          {renderRow('Drainage Work', details.drainageWork)}
          {renderRow('Water Supply Work', details.waterSupplyWork)}
          {renderRow('Rate Type', details.rateType)}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Electrical Labour':
      return (
        <div className="space-y-1">
          {renderRow('Contractor Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('Wiring Work', details.wiringWork)}
          {renderRow('Panel Work', details.panelWork)}
          {renderRow('Earthing Work', details.earthingWork)}
          {renderRow('Rate Per Point', formatRateVal(details.ratePerPoint))}
          {renderRow('Rate Per Sq.ft', formatRateVal(details.ratePerSqFt))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Masonry':
      return (
        <div className="space-y-1">
          {renderRow('Contractor Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('Brick Work', details.brickWork)}
          {renderRow('Block Work', details.blockWork)}
          {renderRow('Plaster Work', details.plasterWork)}
          {renderRow('Rate Per Sq.ft', formatRateVal(details.ratePerSqFt))}
          {renderRow('Rate Per CFT', formatRateVal(details.ratePerCFT))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Tiles Labour':
      return (
        <div className="space-y-1">
          {renderRow('Contractor Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('Floor Tiles', details.floorTiles)}
          {renderRow('Wall Tiles', details.wallTiles)}
          {renderRow('Bathroom Tiles', details.bathroomTiles)}
          {renderRow('Tile Installation Rate', formatRateVal(details.tileInstallationRate))}
          {renderRow('Granite Installation Rate', formatRateVal(details.graniteInstallationRate))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Window & Section Labour':
      return (
        <div className="space-y-1">
          {renderRow('Vendor Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Aluminium Work', details.aluminiumWork)}
          {renderRow('UPVC Work', details.upvcWork)}
          {renderRow('Glass Work', details.glassWork)}
          {renderRow('Fabrication Work', details.fabricationWork)}
          {renderRow('Installation Rate', formatRateVal(details.installationRate))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Fire Labour':
      return (
        <div className="space-y-1">
          {renderRow('Contractor Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('Fire Sprinkler', details.fireSprinkler)}
          {renderRow('Fire Hydrant', details.fireHydrant)}
          {renderRow('Fire Alarm', details.fireAlarm)}
          {renderRow('Installation Rate', formatRateVal(details.installationRate))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Lift Material + Installation':
      return (
        <div className="space-y-1">
          {renderRow('Company Name', agency.agencyName)}
          {renderRow('Contact Person', agency.contactPerson)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Lift Type', details.liftType)}
          {renderRow('Passenger Capacity', details.passengerCapacity)}
          {renderRow('Number of Floors', details.numberOfFloors)}
          {renderRow('Material Cost', formatRateVal(details.materialCost))}
          {renderRow('Installation Cost', formatRateVal(details.installationCost))}
          {renderRow('AMC Cost', formatRateVal(details.amcCost))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Color Labour':
      return (
        <div className="space-y-1">
          {renderRow('Contractor Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('Interior Paint', details.interiorPaint)}
          {renderRow('Exterior Paint', details.exteriorPaint)}
          {renderRow('Texture Paint', details.texturePaint)}
          {renderRow('Waterproofing', details.waterproofing)}
          {renderRow('Rate Per Sq.ft', formatRateVal(details.ratePerSqFt))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'POP / Gypsum':
      return (
        <div className="space-y-1">
          {renderRow('Contractor Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('POP Ceiling', details.popCeiling)}
          {renderRow('Gypsum Ceiling', details.gypsumCeiling)}
          {renderRow('Partition Work', details.partitionWork)}
          {renderRow('Rate Per Sq.ft', formatRateVal(details.ratePerSqFt))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    case 'Fabrication':
      return (
        <div className="space-y-1">
          {renderRow('Fabricator Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Experience', details.experience)}
          {renderRow('Labour Strength', agency.workerCount)}
          {renderRow('MS Work', details.msWork)}
          {renderRow('SS Work', details.ssWork)}
          {renderRow('Gate Work', details.gateWork)}
          {renderRow('Railing Work', details.railingWork)}
          {renderRow('Shed Work', details.shedWork)}
          {renderRow('Rate Per Kg', formatRateVal(details.ratePerKg))}
          {renderRow('Service Area', details.serviceArea)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
    default:
      return (
        <div className="space-y-1">
          {renderRow('Agency Name', agency.agencyName)}
          {renderRow('Mobile Number', agency.phone)}
          {renderRow('Remarks', agency.notes)}
        </div>
      );
  }
};

// Helper: render dynamic input fields based on selected work type in form
const renderDynamicFormFields = (
  category: LabourCategory,
  form: any,
  setForm: any,
  detailsForm: any,
  setDetailsForm: any
) => {
  const handleDetailChange = (key: string, value: any) => {
    setDetailsForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const renderTextField = (label: string, key: string, placeholder = '', required = false) => (
    <div className="space-y-3">
      <Label required={required}>{label}</Label>
      <Input
        required={required}
        v2={true}
        value={detailsForm[key] || ''}
        onChange={e => handleDetailChange(key, e.target.value)}
        placeholder={placeholder}
        className="h-[50px] shadow-md rounded-xl font-bold uppercase"
      />
    </div>
  );

  const renderNumberField = (label: string, key: string, placeholder = '0', required = false) => (
    <div className="space-y-3">
      <Label required={required}>{label}</Label>
      <Input
        required={required}
        v2={true}
        type="number"
        value={detailsForm[key] || ''}
        onChange={e => handleDetailChange(key, e.target.value === '' ? '' : Number(e.target.value))}
        placeholder={placeholder}
        className="h-[50px] shadow-md rounded-xl font-bold tabular-nums"
      />
    </div>
  );

  const renderSelectField = (label: string, key: string, options: string[], required = false) => (
    <div className="space-y-3">
      <Label required={required}>{label}</Label>
      <Select
        required={required}
        v2={true}
        value={detailsForm[key] || ''}
        onChange={e => handleDetailChange(key, e.target.value)}
        className="h-[50px] shadow-md rounded-xl font-bold uppercase"
      >
        <option value="">Select option</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Select>
    </div>
  );

  const renderCommonNameAndPhone = (nameLabel: string, phoneLabel: string) => (
    <>
      <div className="space-y-3">
        <Label required>{nameLabel}</Label>
        <Input
          required
          v2={true}
          value={form.agencyName}
          onChange={e => setForm((prev: any) => ({ ...prev, agencyName: e.target.value }))}
          placeholder="e.g. name / company"
          className="h-[50px] shadow-md rounded-xl font-bold uppercase"
        />
      </div>
      <div className="space-y-3">
        <Label required>{phoneLabel}</Label>
        <Input
          required
          v2={true}
          value={form.phone}
          onChange={e => setForm((prev: any) => ({ ...prev, phone: e.target.value }))}
          placeholder="+91 XXXX XXX XXX"
          className="h-[50px] shadow-md rounded-xl font-bold tabular-nums"
        />
      </div>
    </>
  );

  const renderExperienceAndStrength = (showStrength = true) => {
    const experienceLabel = category === 'RCC Contractor' ? 'Experience (Years)' : 'Experience';
    return (
      <>
        {renderNumberField(experienceLabel, 'experience', 'e.g. 5')}
        {showStrength && (
          <div className="space-y-3">
            <Label>Labour Strength</Label>
            <Input
              v2={true}
              type="number"
              value={form.workerCount || ''}
              onChange={e => setForm((prev: any) => ({ ...prev, workerCount: e.target.value === '' ? 0 : Number(e.target.value) }))}
              placeholder="e.g. 15"
              className="h-[50px] shadow-md rounded-xl font-bold tabular-nums"
            />
          </div>
        )}
      </>
    );
  };

  switch (category) {
    case 'RCC Contractor':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Contractor Name', 'Mobile Number')}
          {renderTextField('Company Name', 'companyName', 'e.g. Structural Builders')}
          {renderExperienceAndStrength(true)}
          {renderNumberField('RCC Rate (₹)', 'rccRate', 'per sqft')}
          {renderNumberField('Shuttering Rate (₹)', 'shutteringRate', 'per sqft')}
          {renderNumberField('Steel Binding Rate (₹)', 'steelBindingRate', 'per kg')}
          {renderSelectField('Labour Only / Labour + Material', 'contractType', ['Labour Only', 'Labour + Material'])}
          {renderTextField('Areas Served', 'serviceArea', 'e.g. Sector-15')}
        </div>
      );
    case 'Plumbing Agency':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Agency Name', 'Mobile Number')}
          <div className="space-y-3">
            <Label required>Contact Person</Label>
            <Input
              required
              v2={true}
              value={form.contactPerson}
              onChange={e => setForm((prev: any) => ({ ...prev, contactPerson: e.target.value }))}
              placeholder="e.g. John Doe"
              className="h-[50px] shadow-md rounded-xl font-bold uppercase"
            />
          </div>
          {renderExperienceAndStrength(true)}
          {renderSelectField('Internal Plumbing', 'internalPlumbing', ['Yes', 'No'])}
          {renderSelectField('External Plumbing', 'externalPlumbing', ['Yes', 'No'])}
          {renderSelectField('Drainage Work', 'drainageWork', ['Yes', 'No'])}
          {renderSelectField('Water Supply Work', 'waterSupplyWork', ['Yes', 'No'])}
          {renderSelectField('Rate Type', 'rateType', ['Per Point', 'Per SqFt', 'Contract', 'Per Day'])}
          {renderTextField('Service Area', 'serviceArea', 'e.g. Noida')}
        </div>
      );
    case 'Electrical Labour':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Contractor Name', 'Mobile Number')}
          {renderExperienceAndStrength(true)}
          {renderSelectField('Wiring Work', 'wiringWork', ['Yes', 'No'])}
          {renderSelectField('Panel Work', 'panelWork', ['Yes', 'No'])}
          {renderSelectField('Earthing Work', 'earthingWork', ['Yes', 'No'])}
          {renderNumberField('Rate Per Point (₹)', 'ratePerPoint')}
          {renderNumberField('Rate Per Sq.ft (₹)', 'ratePerSqFt')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    case 'Masonry':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Contractor Name', 'Mobile Number')}
          {renderExperienceAndStrength(true)}
          {renderSelectField('Brick Work', 'brickWork', ['Yes', 'No'])}
          {renderSelectField('Block Work', 'blockWork', ['Yes', 'No'])}
          {renderSelectField('Plaster Work', 'plasterWork', ['Yes', 'No'])}
          {renderNumberField('Rate Per Sq.ft (₹)', 'ratePerSqFt')}
          {renderNumberField('Rate Per CFT (₹)', 'ratePerCFT')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    case 'Tiles Labour':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Contractor Name', 'Mobile Number')}
          {renderExperienceAndStrength(true)}
          {renderSelectField('Floor Tiles', 'floorTiles', ['Yes', 'No'])}
          {renderSelectField('Wall Tiles', 'wallTiles', ['Yes', 'No'])}
          {renderSelectField('Bathroom Tiles', 'bathroomTiles', ['Yes', 'No'])}
          {renderNumberField('Tile Installation Rate (₹)', 'tileInstallationRate')}
          {renderNumberField('Granite Installation Rate (₹)', 'graniteInstallationRate')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    case 'Window & Section Labour':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Vendor Name', 'Mobile Number')}
          {renderExperienceAndStrength(false)}
          {renderSelectField('Aluminium Work', 'aluminiumWork', ['Yes', 'No'])}
          {renderSelectField('UPVC Work', 'upvcWork', ['Yes', 'No'])}
          {renderSelectField('Glass Work', 'glassWork', ['Yes', 'No'])}
          {renderSelectField('Fabrication Work', 'fabricationWork', ['Yes', 'No'])}
          {renderNumberField('Installation Rate (₹)', 'installationRate')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    case 'Fire Labour':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Contractor Name', 'Mobile Number')}
          {renderExperienceAndStrength(true)}
          {renderSelectField('Fire Sprinkler', 'fireSprinkler', ['Yes', 'No'])}
          {renderSelectField('Fire Hydrant', 'fireHydrant', ['Yes', 'No'])}
          {renderSelectField('Fire Alarm', 'fireAlarm', ['Yes', 'No'])}
          {renderNumberField('Installation Rate (₹)', 'installationRate')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    case 'Lift Material + Installation':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Company Name', 'Mobile Number')}
          <div className="space-y-3">
            <Label required>Contact Person</Label>
            <Input
              required
              v2={true}
              value={form.contactPerson}
              onChange={e => setForm((prev: any) => ({ ...prev, contactPerson: e.target.value }))}
              placeholder="e.g. John Doe"
              className="h-[50px] shadow-md rounded-xl font-bold uppercase"
            />
          </div>
          {renderExperienceAndStrength(false)}
          {renderTextField('Lift Type', 'liftType', 'e.g. Passenger / Hydraulic')}
          {renderTextField('Passenger Capacity', 'passengerCapacity', 'e.g. 6 Passengers')}
          {renderNumberField('Number of Floors', 'numberOfFloors', 'e.g. 4')}
          {renderNumberField('Material Cost (₹)', 'materialCost')}
          {renderNumberField('Installation Cost (₹)', 'installationCost')}
          {renderNumberField('AMC Cost (₹)', 'amcCost')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    case 'Color Labour':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Contractor Name', 'Mobile Number')}
          {renderExperienceAndStrength(true)}
          {renderSelectField('Interior Paint', 'interiorPaint', ['Yes', 'No'])}
          {renderSelectField('Exterior Paint', 'exteriorPaint', ['Yes', 'No'])}
          {renderSelectField('Texture Paint', 'texturePaint', ['Yes', 'No'])}
          {renderSelectField('Waterproofing', 'waterproofing', ['Yes', 'No'])}
          {renderNumberField('Rate Per Sq.ft (₹)', 'ratePerSqFt')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    case 'POP / Gypsum':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Contractor Name', 'Mobile Number')}
          {renderExperienceAndStrength(true)}
          {renderSelectField('POP Ceiling', 'popCeiling', ['Yes', 'No'])}
          {renderSelectField('Gypsum Ceiling', 'gypsumCeiling', ['Yes', 'No'])}
          {renderSelectField('Partition Work', 'partitionWork', ['Yes', 'No'])}
          {renderNumberField('Rate Per Sq.ft (₹)', 'ratePerSqFt')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    case 'Fabrication':
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCommonNameAndPhone('Fabricator Name', 'Mobile Number')}
          {renderExperienceAndStrength(true)}
          {renderSelectField('MS Work', 'msWork', ['Yes', 'No'])}
          {renderSelectField('SS Work', 'ssWork', ['Yes', 'No'])}
          {renderSelectField('Gate Work', 'gateWork', ['Yes', 'No'])}
          {renderSelectField('Railing Work', 'railingWork', ['Yes', 'No'])}
          {renderSelectField('Shed Work', 'shedWork', ['Yes', 'No'])}
          {renderNumberField('Rate Per Kg (₹)', 'ratePerKg')}
          {renderTextField('Service Area', 'serviceArea')}
        </div>
      );
    default:
      return renderCommonNameAndPhone('Agency Name', 'Mobile Number');
  }
};

export default function LabourPage() {
  const { labourAgencies = [], addLabourAgency, updateLabourStatus } = useStore();
  const [activeTab, setActiveTab] = useState<LabourTab>('all');
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('summary');
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(emptyForm);

  // Dynamic details form and interactive simple view states
  const [detailsForm, setDetailsForm] = useState<Record<string, any>>({});
  const [selectedSimpleCategory, setSelectedSimpleCategory] = useState<LabourCategory | null>(null);
  const [selectedSimpleLabourId, setSelectedSimpleLabourId] = useState<string | null>(null);

  const selectedAgency = useMemo(
    () => labourAgencies.find(agency => agency.id === selectedAgencyId),
    [labourAgencies, selectedAgencyId]
  );

  const handleSimpleViewClick = (category: LabourCategory) => {
    setSelectedSimpleCategory(category);
    const firstLabour = labourAgencies.find(a => a.category === category);
    setSelectedSimpleLabourId(firstLabour?.id || null);
  };

  const filteredAgencies = useMemo(() => {
    return labourAgencies.filter(agency => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (agency.agencyName || '').toLowerCase().includes(term) ||
        (agency.category || '').toLowerCase().includes(term) ||
        (agency.contactPerson || '').toLowerCase().includes(term) ||
        (agency.assignedSite || '').toLowerCase().includes(term) ||
        (agency.supervisorName || '').toLowerCase().includes(term);

      const matchesTab = activeTab === 'all' || categoryToTab(agency.category) === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [activeTab, labourAgencies, searchTerm]);

  const stats = useMemo(() => {
    const contractValue = labourAgencies.reduce((sum, agency) => sum + agency.totalContract, 0);
    const paidValue = labourAgencies.reduce((sum, agency) => sum + agency.paidAmount, 0);

    return {
      agencies: labourAgencies.length,
      active: labourAgencies.filter(agency => agency.status === 'Active').length,
      contractValue,
      balance: contractValue - paidValue
    };
  }, [labourAgencies]);

  const dueThisWeek = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date();
    weekEnd.setDate(now.getDate() + 7);
    return labourAgencies.filter(agency => {
      const dueDate = new Date(agency.nextPaymentDate);
      return agency.status === 'Active' && dueDate >= now && dueDate <= weekEnd;
    }).length;
  }, [labourAgencies]);

  const handleAddAgency = (event: React.FormEvent) => {
    event.preventDefault();
    addLabourAgency({
      ...form,
      workerCount: Number(form.workerCount) || Number(detailsForm.labourStrength) || 0,
      startDate: new Date(form.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      nextPaymentDate: new Date(form.nextPaymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      notes: form.notes || undefined,
      details: detailsForm
    });
    setIsAddModalOpen(false);
    setForm(emptyForm);
    setDetailsForm({});
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <div className="space-y-[var(--section-gap)] pb-20 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-[var(--h1-fs)] font-bold text-[var(--text)] tracking-tight leading-tight mb-2 uppercase">Labour</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="success" className="px-3 py-1 text-[11px] font-bold shadow-sm">Workforce</Badge>
              <span className="text-[14px] text-[var(--text3)] font-bold tracking-tight uppercase opacity-80">
                Contractor, agency, site team and payment tracking
              </span>
            </div>
          </div>
          <Button v2={true} className="h-11 px-7 rounded-lg shadow-sm" onClick={() => setIsAddModalOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Labour
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard label="Agencies" value={stats.agencies} color="gold" trend={{ value: "Total", type: "neutral" }} icon={WrenchScrewdriverIcon} />
          <KPICard label="Active Work" value={stats.active} color="green" trend={{ value: "On site", type: "up" }} icon={CheckCircleIcon} />
          <KPICard label="Balance" value={formatCurrency(stats.balance)} color="red" trend={{ value: "Payable", type: "down" }} icon={BanknotesIcon} />
          <KPICard label="Due Soon" value={dueThisWeek} color="amber" trend={{ value: "7 days", type: "neutral" }} icon={CalendarDaysIcon} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
          <Card className="p-0 overflow-hidden shadow-sm min-h-[560px]">
            <div className="p-6 border-b border-[var(--border)] bg-gray-50/30 flex flex-col gap-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'rcc', label: 'RCC' },
                    { id: 'plumbing', label: 'Plumbing' },
                    { id: 'electrical', label: 'Electric' },
                    { id: 'finishing', label: 'Finishing' },
                    { id: 'services', label: 'Fire/Lift' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as LabourTab)}
                      className={`h-9 px-4 rounded-md border text-[10px] font-bold uppercase tracking-[1px] transition-none ${
                        activeTab === tab.id
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                          : 'bg-white text-[var(--text3)] border-[var(--border)] hover:text-[var(--text)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-[var(--border)]">
                    <th className="p-[13px_24px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Agency</th>
                    <th className="p-[13px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Site</th>
                    <th className="p-[13px_15px] text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Rate</th>
                    <th className="p-[13px_15px] text-right text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Balance</th>
                    <th className="p-[13px_24px] text-right text-[10px] font-bold text-[var(--text3)] tracking-[1px] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredAgencies.map(agency => {
                    const balance = agency.totalContract - agency.paidAmount;
                    return (
                      <tr
                        key={agency.id}
                        onClick={() => { setSelectedAgencyId(agency.id); setDrawerTab('summary'); }}
                        className={`hover:bg-gray-50 cursor-pointer ${selectedAgencyId === agency.id ? 'bg-gray-50' : ''}`}
                      >
                        <td className="p-[14px_24px]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-sm">
                              <WrenchScrewdriverIcon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="text-[14px] font-bold text-[var(--text)] tracking-tight uppercase">{agency.agencyName}</div>
                              <div className="text-[10px] text-[var(--text3)] font-bold tracking-[1px] uppercase opacity-60">{agency.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-[14px_15px]">
                          <div className="text-[13px] font-bold text-[var(--text)]">{agency.assignedSite}</div>
                          <div className="text-[10px] text-[var(--text3)] font-bold uppercase opacity-50 mt-1">Supervisor: {agency.supervisorName || 'Not set'}</div>
                        </td>
                        <td className="p-[14px_15px]">
                          <div className="text-[13px] font-bold text-[var(--text)] tabular-nums">{formatCurrency(agency.rate)}</div>
                          <div className="text-[10px] text-[var(--text3)] font-bold uppercase opacity-50 mt-1">{agency.rateType}</div>
                        </td>
                        <td className="p-[14px_15px] text-right text-[14px] font-bold tabular-nums text-[var(--text)]">{formatCurrency(balance)}</td>
                        <td className="p-[14px_24px] text-right">
                          <Badge variant={statusVariant(agency.status)} className="shadow-sm text-[9px] font-bold">{agency.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAgencies.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-16 text-center">
                        <div className="flex flex-col items-center text-[var(--text3)] opacity-50">
                          <WrenchScrewdriverIcon className="w-12 h-12 mb-4" />
                          <span className="text-[11px] font-bold uppercase tracking-[2px]">No labour records found</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-50 rounded border border-[var(--border)] flex items-center justify-center text-amber-600">
                  <ClipboardDocumentCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-[var(--text)] uppercase">Simple View</h2>
                  <p className="text-[10px] text-[var(--text3)] font-bold uppercase opacity-60">Only important labour details</p>
                </div>
              </div>
              <div className="space-y-2">
                {labourCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleSimpleViewClick(category)}
                    className="flex items-center justify-between p-3 rounded border border-[var(--border)] bg-gray-50/50 hover:bg-gray-100/80 transition-all text-left w-full cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-gray-600 uppercase">{category}</span>
                    <span className="text-[12px] font-bold text-gray-900 tabular-nums">
                      {labourAgencies.filter(agency => agency.category === category).length}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {selectedAgency && (
        <div className="fixed inset-0 z-[400] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedAgencyId(null)}></div>
          <div className="relative w-[470px] max-w-full bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="w-11 h-11 bg-amber-50 rounded flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm shrink-0">
                  <WrenchScrewdriverIcon className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-tight mb-1 uppercase truncate">{selectedAgency.agencyName}</h2>
                  <p className="text-[11px] text-gray-400 font-bold tracking-widest opacity-85 leading-none uppercase truncate">{selectedAgency.category}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded border h-10 w-10 shadow-sm" onClick={() => setSelectedAgencyId(null)}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="flex gap-5 border-b border-gray-100">
                {[
                  { id: 'summary', label: 'Summary' },
                  { id: 'payment', label: 'Payment' },
                  { id: 'scope', label: 'Scope' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerTab(tab.id as DrawerTab)}
                    className={`pb-2.5 text-[12px] font-bold tracking-wider relative uppercase transition-colors ${drawerTab === tab.id ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab.label}
                    {drawerTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600"></div>}
                  </button>
                ))}
              </div>

              {drawerTab === 'summary' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded border border-[var(--border)] shadow-inner">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Status</span>
                      <Badge variant={statusVariant(selectedAgency.status)}>{selectedAgency.status}</Badge>
                    </div>
                    <div className="p-3 bg-gray-50 rounded border border-[var(--border)] shadow-inner">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Quality</span>
                      <Badge variant={qualityVariant(selectedAgency.qualityRating)}>{selectedAgency.qualityRating}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      ['Contact person', selectedAgency.contactPerson],
                      ['Phone', selectedAgency.phone],
                      ['Assigned site', selectedAgency.assignedSite],
                      ['Supervisor', selectedAgency.supervisorName],
                      ['Start date', selectedAgency.startDate]
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between p-3 bg-white rounded border border-[var(--border)] shadow-sm gap-4">
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">{label}</span>
                        <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tight text-right">{value || 'Not set'}</span>
                      </div>
                    ))}
                  </div>

                  {selectedAgency.details && Object.keys(selectedAgency.details).length > 0 && (
                    <div className="space-y-2.5 mt-6 border-t pt-6">
                      <h3 className="text-[12px] font-bold text-amber-600 tracking-wider uppercase mb-3">Work-Type Details</h3>
                      {renderDetailsForCategory(selectedAgency)}
                    </div>
                  )}

                  <div className="p-4 bg-gray-900 text-white rounded border border-gray-800 flex items-center gap-3 shadow-inner">
                    <PhoneIcon className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[12px] font-bold text-white/60 uppercase tracking-wide leading-tight">
                      Keep one contact owner and one site supervisor so follow-up stays simple.
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'payment' && (
                <div className="space-y-4">
                  <div className="p-5 bg-gray-900 rounded text-white shadow-xl">
                    <p className="text-[10px] font-bold text-white/40 tracking-[2px] uppercase mb-2">Contract value</p>
                    <p className="text-[28px] font-bold font-price leading-none">{formatCurrency(selectedAgency.totalContract)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded border border-[var(--border)] shadow-inner">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Paid</span>
                      <span className="text-[15px] font-bold text-green-600 tabular-nums">{formatCurrency(selectedAgency.paidAmount)}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded border border-[var(--border)] shadow-inner">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Balance</span>
                      <span className="text-[15px] font-bold text-red-600 tabular-nums">{formatCurrency(selectedAgency.totalContract - selectedAgency.paidAmount)}</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 bg-white rounded border border-[var(--border)] shadow-sm">
                      <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Rate</span>
                      <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">{formatCurrency(selectedAgency.rate)} - {selectedAgency.rateType}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded border border-[var(--border)] shadow-sm">
                      <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Next payment</span>
                      <span className="text-[13px] font-bold text-gray-900 uppercase tracking-tight">{selectedAgency.nextPaymentDate}</span>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'scope' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded border border-[var(--border)] shadow-inner">
                    <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Category</span>
                    <span className="text-[13px] font-bold text-gray-900 uppercase">{selectedAgency.category}</span>
                  </div>
                  <div className="p-4 bg-amber-50 rounded border border-amber-100 shadow-sm flex gap-3">
                    <ShieldCheckIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-amber-800 font-bold uppercase tracking-wide leading-relaxed">
                      {selectedAgency.notes || 'Scope notes can hold work area, floor, block, pending checklist or special instructions.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-white">
              <Button variant="secondary" className="flex-1 h-[44px] rounded border font-bold uppercase tracking-wider shadow-sm bg-white text-[12px]" onClick={() => setSelectedAgencyId(null)}>
                Close
              </Button>
              <Button className="flex-[2] h-[44px] rounded shadow-md font-bold uppercase tracking-wider text-[12px]" onClick={() => setIsStatusModalOpen(true)}>
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Change Status
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container max-w-5xl shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <PlusIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Add Labour</h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">Contractor or agency record</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => setIsAddModalOpen(false)}>
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleAddAgency} className="modal-body space-y-8 text-left">
              {/* Section 1: Work Type Selection */}
              <div className="p-5 bg-gray-50 border rounded-2xl space-y-4">
                <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Select Category</h3>
                <div className="max-w-md space-y-3">
                  <Label required>Work type</Label>
                  <Select v2={true} value={form.category} onChange={event => {
                    setForm({ ...form, category: event.target.value as LabourCategory });
                    setDetailsForm({});
                  }} className="h-[50px] shadow-md rounded-xl font-bold uppercase">
                    <option value="">Select Work Type</option>
                    {labourCategories.map(category => <option key={category} value={category}>{category}</option>)}
                  </Select>
                </div>
              </div>

              {form.category ? (
                <>
                  {/* Section 2: Dynamic Form Fields based on Work Type */}
                  <div className="p-6 border rounded-2xl space-y-6">
                    <h3 className="text-[12px] font-bold text-amber-600 uppercase tracking-widest">Work-Type Specific Details</h3>
                    {renderDynamicFormFields(form.category, form, setForm, detailsForm, setDetailsForm)}
                  </div>

                  {/* Section 3: Operational & Contract Details */}
                  <div className="p-6 border rounded-2xl bg-gray-50/20 space-y-6">
                    <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Operational & Contract Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label required>Assigned site</Label>
                        <Input required v2={true} value={form.assignedSite} onChange={event => setForm({ ...form, assignedSite: event.target.value })} placeholder="Project / block / floor" className="h-[50px] shadow-md rounded-xl font-bold uppercase" />
                      </div>
                      <div className="space-y-3">
                        <Label required>Supervisor</Label>
                        <Input required v2={true} value={form.supervisorName} onChange={event => setForm({ ...form, supervisorName: event.target.value })} placeholder="Site supervisor" className="h-[50px] shadow-md rounded-xl font-bold uppercase" />
                      </div>
                      <div className="space-y-3">
                        <Label required>Status</Label>
                        <Select v2={true} value={form.status} onChange={event => setForm({ ...form, status: event.target.value as LabourStatus })} className="h-[50px] shadow-md rounded-xl font-bold uppercase">
                          {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label required>Quality Rating</Label>
                        <Select v2={true} value={form.qualityRating} onChange={event => setForm({ ...form, qualityRating: event.target.value as QualityRating })} className="h-[50px] shadow-md rounded-xl font-bold uppercase">
                          <option value="Good">Good</option>
                          <option value="Average">Average</option>
                          <option value="Needs Attention">Needs Attention</option>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label required>Rate Type</Label>
                        <Select v2={true} value={form.rateType} onChange={event => setForm({ ...form, rateType: event.target.value as RateType })} className="h-[50px] shadow-md rounded-xl font-bold uppercase">
                          <option value="Contract">Contract</option>
                          <option value="Per SqFt">Per SqFt</option>
                          <option value="Per Day">Per Day</option>
                          <option value="Per Point">Per Point</option>
                          <option value="Per Unit">Per Unit</option>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label required>Rate</Label>
                        <Input required v2={true} type="number" value={form.rate || ''} onChange={event => setForm({ ...form, rate: Number(event.target.value) })} placeholder="0" className="h-[50px] shadow-md rounded-xl font-bold text-amber-600 tabular-nums" />
                      </div>
                      <div className="space-y-3">
                        <Label required>Total contract</Label>
                        <Input required v2={true} type="number" value={form.totalContract || ''} onChange={event => setForm({ ...form, totalContract: Number(event.target.value) })} placeholder="0" className="h-[50px] shadow-md rounded-xl font-bold text-amber-600 tabular-nums" />
                      </div>
                      <div className="space-y-3">
                        <Label>Paid amount</Label>
                        <Input v2={true} type="number" value={form.paidAmount || ''} onChange={event => setForm({ ...form, paidAmount: Number(event.target.value) })} placeholder="0" className="h-[50px] shadow-md rounded-xl font-bold text-green-600 tabular-nums" />
                      </div>
                      <div className="space-y-3">
                        <Label required>Start date</Label>
                        <Input required v2={true} type="date" value={form.startDate} onChange={event => setForm({ ...form, startDate: event.target.value })} className="h-[50px] shadow-md rounded-xl font-bold tabular-nums" />
                      </div>
                      <div className="space-y-3">
                        <Label required>Next payment</Label>
                        <Input required v2={true} type="date" value={form.nextPaymentDate} onChange={event => setForm({ ...form, nextPaymentDate: event.target.value })} className="h-[50px] shadow-md rounded-xl font-bold tabular-nums" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Remarks</Label>
                    <Input v2={true} value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} placeholder="Enter notes / remarks..." className="h-[50px] shadow-md rounded-xl font-bold uppercase" />
                  </div>

                  <div className="flex items-center gap-5 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <ShieldCheckIcon className="w-9 h-9 text-amber-500 shrink-0" />
                    <p className="text-[13px] text-gray-500 font-bold leading-relaxed uppercase tracking-wide">
                      Keep the record short: who is responsible, where they work, what scope is assigned, and what payment is pending.
                    </p>
                  </div>

                  <div className="pt-4 flex gap-6">
                    <Button type="button" variant="secondary" className="flex-1 h-[52px] rounded-lg font-bold uppercase tracking-widest shadow-md bg-white border-2 text-[11px]" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-[2] h-[52px] rounded-lg font-bold uppercase tracking-widest shadow-xl text-[11px]">
                      Save Labour
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-12 border border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-400">
                  <WrenchScrewdriverIcon className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-[13px] font-bold uppercase tracking-wider">Please select a work type first to fill details.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Simple View Modal */}
      {selectedSimpleCategory && (
        <div className="modal-overlay">
          <div className="modal-container max-w-5xl shadow-2xl h-[80vh] flex flex-col">
            <div className="modal-header border-b pb-4">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <WrenchScrewdriverIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">
                    {selectedSimpleCategory} List
                  </h2>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">
                    Select a name to view detailed records
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-12 w-12 shadow-sm" onClick={() => { setSelectedSimpleCategory(null); setSelectedSimpleLabourId(null); }}>
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="modal-body flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-8 p-6 text-left">
              {/* Left Pane - Names list */}
              <div className="md:col-span-4 border-r pr-6 overflow-y-auto space-y-2">
                <Label className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-3">Labour / Contractor Names</Label>
                {labourAgencies.filter(a => a.category === selectedSimpleCategory).map(agency => (
                  <button
                    key={agency.id}
                    onClick={() => setSelectedSimpleLabourId(agency.id)}
                    className={`w-full p-4 rounded-xl border-2 text-[13px] font-bold uppercase tracking-wide text-left transition-all cursor-pointer ${
                      selectedSimpleLabourId === agency.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold'
                        : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {agency.agencyName}
                  </button>
                ))}
                {labourAgencies.filter(a => a.category === selectedSimpleCategory).length === 0 && (
                  <p className="text-[12px] text-gray-400 font-bold uppercase italic p-4 text-center">No contractors registered under this category.</p>
                )}
              </div>

              {/* Right Pane - Details list */}
              <div className="md:col-span-8 overflow-y-auto p-4 bg-gray-50/50 border rounded-2xl">
                {selectedSimpleLabourId ? (
                  (() => {
                    const agency = labourAgencies.find(a => a.id === selectedSimpleLabourId);
                    if (!agency) return null;
                    return (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                          <h3 className="text-[18px] font-bold text-gray-900 uppercase tracking-tight">{agency.agencyName}</h3>
                          <Badge variant={statusVariant(agency.status)} className="shadow-sm uppercase text-[9px] font-bold">{agency.status}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <Card className="p-5 shadow-sm bg-white border border-gray-100">
                            <h4 className="text-[11px] font-bold text-amber-600 tracking-wider uppercase mb-3">Profile & Dynamic Fields</h4>
                            {renderDetailsForCategory(agency)}
                          </Card>

                          <Card className="p-5 shadow-sm bg-white border border-gray-100">
                            <h4 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3">Operational Details</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-[11px] font-bold text-gray-500 uppercase">Assigned Site</span>
                                <span className="text-[13px] font-bold text-gray-900 uppercase">{agency.assignedSite || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-[11px] font-bold text-gray-500 uppercase">Supervisor</span>
                                <span className="text-[13px] font-bold text-gray-900 uppercase">{agency.supervisorName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-[11px] font-bold text-gray-500 uppercase">Total Contract Value</span>
                                <span className="text-[13px] font-bold text-gray-900 tabular-nums">{formatCurrency(agency.totalContract)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-[11px] font-bold text-gray-500 uppercase">Paid Amount</span>
                                <span className="text-[13px] font-bold text-green-600 tabular-nums">{formatCurrency(agency.paidAmount)}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-[11px] font-bold text-gray-500 uppercase">Remaining Balance</span>
                                <span className="text-[13px] font-bold text-red-600 tabular-nums">{formatCurrency(agency.totalContract - agency.paidAmount)}</span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 py-20">
                    <WrenchScrewdriverIcon className="w-12 h-12 mb-4" />
                    <p className="text-[12px] font-bold uppercase tracking-[2px]">Select a contractor to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && selectedAgency && (
        <div className="modal-overlay">
          <div className="modal-container max-w-lg shadow-2xl">
            <div className="modal-header">
              <div className="flex items-center gap-6 text-left">
                <div className="modal-header-icon text-amber-600">
                  <ArrowPathIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h2 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none mb-1.5 uppercase">Labour Status</h2>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[2px] opacity-60 leading-none">{selectedAgency.agencyName}</p>
                </div>
              </div>
              <Button variant="secondary" size="icon" className="rounded-xl border-2 h-10 w-10 shadow-sm" onClick={() => setIsStatusModalOpen(false)}>
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="modal-body space-y-3 text-left">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => {
                    updateLabourStatus(selectedAgency.id, status);
                    setIsStatusModalOpen(false);
                  }}
                  className={`h-[58px] px-5 rounded-lg border-2 flex items-center justify-between transition-none w-full ${
                    selectedAgency.status === status
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[13px] font-bold uppercase tracking-wider">{status}</span>
                  <Badge variant={statusVariant(status)}>{status === selectedAgency.status ? 'Current' : 'Set'}</Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
