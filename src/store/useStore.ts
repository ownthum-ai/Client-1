import { create } from 'zustand';

// --- Type Definitions ---
export type LeadSource = 'Meta Ad' | 'Website' | 'Walk-in' | 'Broker' | 'Referral';
export type LeadStatus = 'New' | 'In Progress' | 'Converted' | 'Lost';
export type PaymentMode = 'Bank Transfer' | 'Cheque' | 'Cash';

export interface Query {
  id: string;
  name: string;
  phone: string;
  source: LeadSource;
  interest: string;
  budget: string;
  date: string;
  status: LeadStatus;
  isContacted: boolean;
}

export interface Payment {
  id: string;
  customerName: string;
  plotId: string;
  date: string;
  amount: number;
  mode: PaymentMode | 'Cash' | 'DD';
  installmentRatio: string;
  balanceDue: number;
  receiptNumber?: string;
  status: 'Complete' | 'Pending';
  bookingStatus?: 'Active' | 'Cancelled';
}

export type InterestLevel = 'Hot' | 'Warm' | 'Cold' | 'Negotiating';

export interface SiteVisit {
  id: string;
  customerName: string;
  phone: string;
  visitDate: string;
  source: string;
  budget: string;
  preference: string;
  interest: InterestLevel;
  followUpDue: string;
  notes?: string;
  status?: 'Scheduled' | 'Visited' | 'No Show';
}

export type InteractionType = 'Call' | 'Visit' | 'WhatsApp' | 'Receipt';
export type InteractionOutcome = 'Interested' | 'Not Answering' | 'Callback' | 'N/A';

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string;
  outcome: InteractionOutcome;
  notes: string;
  loggedBy: string;
}

export interface FollowUp {
  id: string;
  customerName: string;
  phone: string;
  interest: string;
  lastContact: string; // Keep for quick display
  nextDue: string;
  interactions: Interaction[];
  status: InterestLevel | 'Negotiating' | 'Booked' | 'Lost';
  createdAt: string;
  source?: LeadSource | string;
  brokerName?: string;
}




export interface CommissionRecord {
  id: string;
  plotNumber: string;
  customerName: string;
  amount: number;
  status: 'Paid' | 'Due';
  date: string;
}

export interface Broker {
  id: string;
  name: string;
  firm: string;
  phone: string;
  area: string;
  commissionRate: string;
  leadsSent: number;
  conversions: number;
  totalCommissionEarned: number;
  pendingCommission: number;
  status: 'Active' | 'Inactive';
  commissions: CommissionRecord[];
  lastContact?: string;
}

export interface WeekendPost {
  id: string;
  title: string;
  type: string;
  status: 'Active' | 'Scheduled' | 'Archived';
  image: string;
  date: string;
  attachedBrochureId?: string;
}

export interface TransmissionLog {
  id: string;
  postTitle: string;
  delivered: number;
  read: number;
  channel: 'WhatsApp' | 'Meta' | 'SMS';
  date: string;
}

export interface WeekendRule {
  id: string;
  label: string;
  enabled: boolean;
}

export interface UploadedCsv {
  id: string;
  name: string;
  data: any[];
  date: string;
}

export const LandStatus = {
  UNDER_NEGOTIATION: 'Under Negotiation',
  AGREEMENT_DONE: 'Agreement Done',
  REGISTERED: 'Registered'
} as const;
export type LandStatus = typeof LandStatus[keyof typeof LandStatus];
export interface LandPurchase {
  ratePerSqyd: number;
  id: string;
  surveyNo: string;
  location: string;
  area: string;
  areaUnit: 'Bigha' | 'SqFt' | 'SqMt' | 'SqYards';
  zoneType: 'Residential' | 'Agricultural' | 'Commercial';
  ownerName: string;
  ownerPhone: string;
  purchasePrice: number;
  paidTillDate: number;
  status: LandStatus;
  docs: { name: string; type: string; url: string }[];
  linkedScheme: string;
  payments: { id: string; date: string; amount: number; mode: 'White' | 'Cash'; balance: number }[];
}


export interface Layout {
  id: string;
  name: string;
  landId: string;
  totalPlots: number;
  plotSizes: string;
  roadWidth: string;
  ratePerSqYd: number;
  reraStatus: 'Approved' | 'Pending' | 'Not Applied';
  docs: { name: string; type: string; url: string }[];
}

export type PlotStatus = 'Available' | 'Booked' | 'Sold' | 'Reserved';
export interface Plot {
  id: string; // e.g., 'A-01'
  layoutId: string;
  size: number; // sq yards
  rate: number; // per sqyd
  status: PlotStatus;
  customerName?: string;
  bookingDate?: string;
  amountPaid?: number;
}

export type ConstructionStatus = 'Completed' | 'In Progress' | 'Behind Schedule' | 'Not Started';

export interface ConstructionPhase {
  id: string;
  name: string;
  progress: number;
  targetDate: string;
  status: ConstructionStatus;
  colorVar: string; // e.g. '--green'
  reports?: { id: string; observer: string; action: string; status: string; date: string }[];
  photos?: { id: string; url: string; date: string }[];
}

export interface ConstructionBlock {
  id: string;
  name: string;
  range: string;
  progress: number;
  colorVar: string;
}

export interface MaterialStock {
  id: string;
  name: string;
  current: number;
  capacity: number;
  threshold: number;
  unit: string;
  colorVar: string;
  statusText: string;
}

export interface MaterialTransaction {
  id: string;
  materialName: string;
  type: 'Inward' | 'Outward';
  qty: number;
  unit: string;
  date: string;
  // Inward specific
  vendorName?: string;
  invoiceNumber?: string;
  ratePerUnit?: number;
  totalCost?: number;
  // Outward specific
  projectBlock?: string;
  supervisorName?: string;
}

export type AssetCondition = 'Active' | 'Under Repair' | 'Disposed';
export interface Asset {
  id: string;
  name: string;
  category: 'Heavy Equipment' | 'Construction Tools' | 'IT Equipment' | 'Office Items';
  date: string;
  vendor: string;
  price: number;
  location: string;
  condition: AssetCondition;
  usefulLife: number; // in years
}

export interface PropertyHolderInstallment {
  id: string;
  installmentName: string;
  dueDate: string;
  amount: number;
  condition: string;
  paidDate?: string;
  status: 'Paid' | 'Due in 10 days' | 'Upcoming' | 'Overdue';
  receiptUrl?: string;
}

export interface PropertyHolder {
  id: string;
  name: string;
  parcelId: string;
  totalAmount: number;
  paidAmount: number;
  installments: PropertyHolderInstallment[];
}


export interface SalaryRecord {
  id: string;
  employeeName: string;
  role: string;
  basic: number;
  days: string;
  allowance: number;
  advanceDeduction: number;
  otherDeduction: number;
  net: number;
  status: 'Paid' | 'Pending';
  month: string;
}

export interface SalaryAdvance {
  id: string;
  employeeName: string;
  amount: number;
  date: string;
  month: string;
  deducted: boolean;
}

export interface Brochure {
  id: string;
  title: string;
  version: string;
  date: string;
  type: string;
  size: string;
  url?: string;
  sharedCount: number;
  downloadCount: number;
  lastShared: string;
  icon: string;
  colorGradient: string;
}

export interface BrochureShare {
  id: string;
  date: string;
  customerName: string;
  brochureTitle: string;
  version: string;
  channel: 'WhatsApp';
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: 'Facebook' | 'Instagram' | 'Google' | 'Other';
  budget: number;
  spent: number;
  leads: number;
  cpl: number;
  conversions: number;
  status: 'Active' | 'Completed' | 'Paused';
}

export interface ConstructionCost {
  id: string;
  phaseId: string;
  phaseName: string;
  description: string;
  amount: number;
  category: 'Labour' | 'Material' | 'Equipment' | 'Other';
  materialName?: string;
  materialQty?: number;
  date: string;
}

export interface InspectionAlert {
  id: string;
  phaseId: string;
  phaseName: string;
  observer: string;
  status: string;
  date: string;
}

export interface ActivityFeedItem {
  id: string;
  message: string;
  type: 'weekend_post' | 'brochure' | 'booking' | 'payment' | 'followup' | 'system' | 'material_inward' | 'material_outward' | 'material_alert' | 'land_payment' | 'land_overdue' | 'land_schedule' | 'construction_alert' | 'staff_alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  timestamp: string;
}


// --- Store Context ---
interface StoreState {
  activeModule: string;
  setActiveModule: (m: string) => void;
  isPinUnlocked: boolean;
  globalModal: 'siteVisit' | 'query' | 'payment' | 'material' | null;
  setPinUnlocked: (v: boolean) => void;
  unlockPin: (pin: string) => boolean;
  lockPin: () => void;
  setGlobalModal: (m: 'siteVisit' | 'query' | 'payment' | 'material' | null) => void;
  notifications: number;
  unreadQueries: number;
  unreadFollowUps: number;

  // Auth
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;

  // Phase 2: Mock Database
  queries: Query[];
  addQuery: (query: Omit<Query, 'id' | 'date' | 'isContacted'>) => void;
  updateQueryStatus: (id: string, status: LeadStatus) => void;
  markAsContacted: (id: string) => void;
  deleteQuery: (id: string) => void;
  updateQuery: (id: string, queryData: Partial<Query>) => void;

  siteVisits: SiteVisit[];
  addSiteVisit: (visit: Omit<SiteVisit, 'id'>) => void;
  updateSiteVisitStatus: (id: string, status: 'Scheduled' | 'Visited' | 'No Show') => void;
  deleteSiteVisit: (id: string) => void;
  updateSiteVisit: (id: string, visitData: Partial<SiteVisit>) => void;

  followUps: FollowUp[];
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'interactions'>) => void;
  addFollowUpInteraction: (followUpId: string, interaction: Omit<Interaction, 'id' | 'date' | 'loggedBy'>) => void;
  updateFollowUpStatus: (followUpId: string, status: FollowUp['status']) => void;

  brokers: Broker[];
  addBroker: (broker: Omit<Broker, 'id' | 'commissions' | 'leadsSent' | 'conversions' | 'totalCommissionEarned' | 'pendingCommission' | 'status'>) => void;
  updateBrokerStatus: (id: string, status: 'Active' | 'Inactive') => void;
  markCommissionPaid: (brokerId: string, commissionId: string) => void;

  weekendPosts: WeekendPost[];
  transmissionLogs: TransmissionLog[];
  weekendRules: WeekendRule[];
  uploadedCsvs: UploadedCsv[];
  deployWeekendPost: (post: Omit<WeekendPost, 'id' | 'date'>) => void;
  deleteWeekendPost: (id: string) => void;
  updateWeekendRule: (id: string, enabled: boolean) => void;
  logWeekendPost: (post: Omit<WeekendPost, 'id' | 'date'>) => void;
  sendWeekendPostToCsvContacts: (postTitle: string, contacts: any[]) => void;
  sendWeekendPostToBrokers: (postTitle: string) => void;
  addUploadedCsv: (csv: Omit<UploadedCsv, 'id' | 'date'>) => void;
  deleteUploadedCsv: (id: string) => void;

  lands: LandPurchase[];
  addLand: (land: Omit<LandPurchase, 'id'>) => void;
  updateLandStatus: (id: string, status: LandStatus) => void;
  addLandDoc: (landId: string, doc: { name: string; type: string; url: string }) => void;
  addLandPayment: (landId: string, payment: Omit<LandPurchase['payments'][0], 'id'>) => void;


  layouts: Layout[];
  addLayout: (layout: Omit<Layout, 'id'>) => void;
  plots: Plot[];
  updatePlotStatus: (id: string, status: PlotStatus, customerName?: string, amount?: number) => void;
  updatePlotDimensions: (id: string, size: number, rate: number) => void;
  addLayoutDoc: (layoutId: string, doc: { name: string; type: string; url: string }) => void;
  // Construction
  constructionPhases: ConstructionPhase[];
  updatePhaseProgress: (id: string, progress: number, status?: ConstructionStatus) => void;
  addConstructionPhase: (phase: Omit<ConstructionPhase, 'id' | 'reports' | 'photos'>) => void;
  deleteConstructionPhase: (id: string) => void;
  addReport: (phaseId: string, report: Omit<{ id: string; observer: string; action: string; status: string; date: string }, 'id'>) => void;
  addPhoto: (phaseId: string, photo: Omit<{ id: string; url: string; date: string }, 'id'>) => void;

  constructionBlocks: ConstructionBlock[];
  addConstructionBlock: (block: Omit<ConstructionBlock, 'id'>) => void;
  deleteConstructionBlock: (id: string) => void;
  updateBlockProgress: (id: string, progress: number) => void;

  materialStock: MaterialStock[];
  materialTxns: MaterialTransaction[];
  addMaterialTxn: (txn: Omit<MaterialTransaction, 'id'>) => void;
  addMaterial: (material: Omit<MaterialStock, 'id' | 'current' | 'statusText'>) => void;
  deleteMaterial: (id: string) => void;
  updateMaterialThreshold: (id: string, threshold: number) => void;

  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAssetCondition: (id: string, condition: AssetCondition) => void;
  updateAsset: (id: string, assetData: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;

  propertyHolders: PropertyHolder[];
  markInstallmentPaid: (holderId: string, installmentId: string, paidDate: string) => void;
  uploadInstallmentReceipt: (holderId: string, installmentId: string, url: string) => void;
  addPropertyHolderInstallment: (holderId: string, installment: Omit<PropertyHolderInstallment, 'id'>) => void;

  salaries: SalaryRecord[];
  addSalary: (salary: Omit<SalaryRecord, 'id'>) => void;
  updateSalaryStatus: (id: string, status: 'Paid' | 'Pending') => void;

  salaryAdvances: SalaryAdvance[];
  addSalaryAdvance: (advance: Omit<SalaryAdvance, 'id' | 'deducted'>) => void;
  processPayroll: (month: string) => void;

  brochures: Brochure[];
  brochureShares: BrochureShare[];
  logBrochureShare: (share: Omit<BrochureShare, 'id' | 'date'>) => void;
  addBrochure: (brochure: Omit<Brochure, 'id' | 'lastShared' | 'sharedCount' | 'downloadCount'>) => void;
  attachBrochureToWeekendPost: (postId: string, brochureId: string) => void;
  updateBrochure: (id: string, data: Partial<Brochure>) => void;

  campaigns: MarketingCampaign[];
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => void;

  constructionCosts: ConstructionCost[];
  addConstructionCost: (cost: Omit<ConstructionCost, 'id' | 'date'>) => void;

  inspectionAlerts: InspectionAlert[];

  activityFeed: ActivityFeedItem[];
  addActivityFeedItem: (item: Omit<ActivityFeedItem, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  clearActivityFeed: () => void;
  sendWeekendPostNow: (postTitle: string, contactCount: number) => void;
}

const initialQueries: Query[] = [];
const initialPayments: Payment[] = [];
const initialPropertyHolders: PropertyHolder[] = [];
const initialSalaries: SalaryRecord[] = [];
const initialSalaryAdvances: SalaryAdvance[] = [];
const initialBrochures: Brochure[] = [];
const initialBrochureShares: BrochureShare[] = [];
const initialCampaigns: MarketingCampaign[] = [];
const initialSiteVisits: SiteVisit[] = [];
const initialFollowUps: FollowUp[] = [];
const initialBrokers: Broker[] = [];
const initialTransmissionLogs: TransmissionLog[] = [];
const initialWeekendRules: WeekendRule[] = [
  { id: 'r1', label: 'Auto-Send Saturday 09:00', enabled: false },
  { id: 'r2', label: 'Include Broker Meta-Tags', enabled: false },
  { id: 'r3', label: 'Confirm Before SMS Batch', enabled: false },
  { id: 'r4', label: 'Dormant Lead Loop (Sync)', enabled: true },
];
const initialWeekendPosts: WeekendPost[] = [];
const initialLands: LandPurchase[] = [];
const initialLayouts: Layout[] = [];
const initialPlots: Plot[] = [];
const initialConstructionPhases: ConstructionPhase[] = [];
const initialConstructionBlocks: ConstructionBlock[] = [];
const initialMaterialStock: MaterialStock[] = [
  { id: 'm1', name: 'Steel TMT Bars', current: 12500, capacity: 25000, threshold: 5000, unit: 'kg', colorVar: '--blue', statusText: 'STABLE' },
  { id: 'm2', name: 'Cement (OPC/PPC)', current: 420, capacity: 2000, threshold: 600, unit: 'bags', colorVar: '--amber', statusText: 'LOW' },
  { id: 'm3', name: 'River Sand', current: 1800, capacity: 5000, threshold: 1000, unit: 'cft', colorVar: '--gold', statusText: 'STABLE' },
  { id: 'm4', name: 'Red Bricks', current: 45000, capacity: 100000, threshold: 15000, unit: 'nos', colorVar: '--green', statusText: 'STABLE' },
];
const initialMaterialTxns: MaterialTransaction[] = [
  { id: 'mt1', materialName: 'Steel TMT Bars', type: 'Inward', qty: 15000, unit: 'kg', date: '20 Mar 2026', vendorName: 'Tata Tiscon', invoiceNumber: 'INV/2026/001', ratePerUnit: 72, totalCost: 1080000 },
  { id: 'mt2', materialName: 'Steel TMT Bars', type: 'Outward', qty: 2500, unit: 'kg', date: '24 Mar 2026', projectBlock: 'Tower A - Foundation', supervisorName: 'Rahul Sharma' },
  { id: 'mt3', materialName: 'Cement (OPC/PPC)', type: 'Inward', qty: 500, unit: 'bags', date: '21 Mar 2026', vendorName: 'UltraTech', invoiceNumber: 'UT/9982', ratePerUnit: 440, totalCost: 220000 },
  { id: 'mt4', materialName: 'Cement (OPC/PPC)', type: 'Outward', qty: 80, unit: 'bags', date: '25 Mar 2026', projectBlock: 'Tower A - Plinth', supervisorName: 'Rahul Sharma' },
  { id: 'mt5', materialName: 'Red Bricks', type: 'Inward', qty: 50000, unit: 'nos', date: '22 Mar 2026', vendorName: 'Local Kiln 1', invoiceNumber: 'BK-552', ratePerUnit: 8, totalCost: 400000 },
  { id: 'mt6', materialName: 'Red Bricks', type: 'Outward', qty: 5000, unit: 'nos', date: '26 Mar 2026', projectBlock: 'Boundary Wall', supervisorName: 'Amit V.' },
];
const initialAssets: Asset[] = [];
const initialUploadedCsvs: UploadedCsv[] = [];
const initialConstructionCosts: ConstructionCost[] = [];
const initialInspectionAlerts: InspectionAlert[] = [];
const initialActivityFeed: ActivityFeedItem[] = [];

export const useStore = create<StoreState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (m) => set((state) => ({
    activeModule: m,
    ...(m === 'query' ? { unreadQueries: 0 } : {}),
    ...(m === 'followup' ? { unreadFollowUps: 0 } : {})
  })),

  isPinUnlocked: false,
  globalModal: null,
  setPinUnlocked: (v) => set({ isPinUnlocked: v }),
  setGlobalModal: (m) => set({ globalModal: m }),
  unlockPin: (pin: string) => {
    if (pin === '1234') {
      set({ isPinUnlocked: true });
      return true;
    }
    return false;
  },
  lockPin: () => set({ isPinUnlocked: false }),

  notifications: 0,
  unreadQueries: 0,
  unreadFollowUps: 0,

  // --- Auth ---
  isAuthenticated: false,
  login: (password) => {
    if (password === '1234') {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),

  // --- Mock DB State ---
  queries: initialQueries,
  addQuery: (queryData) => set((state) => {
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Cascade 1: Auto-create follow-up for today
    const alreadyHasFollowUp = state.followUps.some(f => f.phone === queryData.phone);
    let updatedFollowUps = state.followUps;

    // Check if source is Broker or specific broker name, increment broker's leadsSent
    const isBrokerSource = (queryData.source as string) === 'Broker' || (queryData.source as string).startsWith('Broker: ');
    const brokerName = (queryData.source as string).startsWith('Broker: ') ? (queryData.source as string).replace('Broker: ', '') : null;

    if (!alreadyHasFollowUp) {
      const newFollowUp: FollowUp = {
        id: `f-${Math.random().toString(36).substr(2, 9)}`,
        customerName: queryData.name,
        phone: queryData.phone,
        interest: queryData.interest,
        lastContact: timestamp,
        nextDue: timestamp,
        interactions: [],
        status: 'Warm',
        createdAt: timestamp,
        source: queryData.source,
        brokerName: brokerName || undefined
      };
      updatedFollowUps = [newFollowUp, ...state.followUps];
    }

    let updatedBrokers = state.brokers;
    if (isBrokerSource) {
      updatedBrokers = state.brokers.map(b => {
        if (b.status === 'Active') {
          if (brokerName) {
            if (b.name.toLowerCase() === brokerName.toLowerCase()) {
              return { ...b, leadsSent: b.leadsSent + 1 };
            }
            return b;
          }
          return { ...b, leadsSent: b.leadsSent + 1 };
        }
        return b;
      });
    }

    return {
      queries: [
        {
          ...queryData,
          id: `q${Date.now()}`,
          date: timestamp,
          isContacted: false
        },
        ...state.queries
      ],
      unreadQueries: state.activeModule === 'query' ? 0 : state.unreadQueries + 1,
      followUps: updatedFollowUps,
      brokers: updatedBrokers
    };
  }),
  updateQueryStatus: (id, status) => set((state) => {
    const query = state.queries.find(q => q.id === id);
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Cascade 1: Auto-create follow-up on 'In Progress' if not exists
    const shouldCreateFollowUp = status === 'In Progress' && query && !state.followUps.some(f => f.phone === query.phone);
    let updatedFollowUps = state.followUps;
    if (shouldCreateFollowUp && query) {
      const newFollowUp: FollowUp = {
        id: `f-${Math.random().toString(36).substr(2, 9)}`,
        customerName: query.name,
        phone: query.phone,
        interest: query.interest,
        lastContact: query.date,
        nextDue: new Date(Date.now() + 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        interactions: [],
        status: 'Warm',
        createdAt: timestamp,
      };
      updatedFollowUps = [newFollowUp, ...state.followUps];
    }

    // Cascade 2: On 'Converted' — book plot, create payment, update follow-up to 'Booked'
    let updatedPlots = state.plots;
    let updatedPayments = state.payments;

    if (status === 'Converted' && query) {
      // Find plot matching the query interest (plot id like "A-01" or layout name)
      const matchingPlot = state.plots.find(p =>
        p.id.toLowerCase() === query.interest.toLowerCase() ||
        (p.customerName && p.customerName.toLowerCase() === query.name.toLowerCase())
      );

      if (matchingPlot && matchingPlot.status !== 'Sold') {
        const plotValue = (matchingPlot.size || 0) * (matchingPlot.rate || 0);

        // Book the plot
        updatedPlots = state.plots.map(p => {
          if (p.id === matchingPlot.id) {
            return {
              ...p,
              status: 'Booked' as PlotStatus,
              customerName: query.name,
              bookingDate: timestamp,
              amountPaid: 0
            };
          }
          return p;
        });

        // Create payment record
        const bookingPayment: Payment = {
          id: `p${Date.now()}`,
          customerName: query.name,
          plotId: matchingPlot.id,
          date: timestamp,
          amount: 0,
          mode: 'Bank Transfer',
          installmentRatio: 'Booking Amount',
          balanceDue: plotValue,
          status: 'Pending',
          receiptNumber: `BK-${Date.now().toString().slice(-4)}`,
          bookingStatus: 'Active'
        };
        updatedPayments = [bookingPayment, ...state.payments];
      }

      // Update matching follow-up status to 'Booked'
      updatedFollowUps = updatedFollowUps.map(f => {
        if (f.phone === query.phone || f.customerName.toLowerCase() === query.name.toLowerCase()) {
          return { ...f, status: 'Booked' as const };
        }
        return f;
      });
    }

    return {
      queries: state.queries.map(q => q.id === id ? { ...q, status } : q),
      followUps: updatedFollowUps,
      plots: updatedPlots,
      payments: updatedPayments
    };
  }),
  markAsContacted: (id) => set((state) => ({
    queries: state.queries.map(q => q.id === id ? { ...q, isContacted: true } : q)
  })),
  deleteQuery: (id: string) => set((state) => ({
    queries: state.queries.filter(q => q.id !== id)
  })),
  updateQuery: (id: string, queryData: Partial<Query>) => set((state) => ({
    queries: state.queries.map(q => q.id === id ? { ...q, ...queryData } : q)
  })),

  siteVisits: initialSiteVisits,
  addSiteVisit: (visit) => set((state) => {
    const newVisitId = `v-${Math.random().toString(36).substr(2, 9)}`;
    const alreadyExists = state.followUps.some(f => f.phone === visit.phone);
    const newFollowUp: FollowUp | null = !alreadyExists ? {
      id: `f-${Math.random().toString(36).substr(2, 9)}`,
      customerName: visit.customerName,
      phone: visit.phone,
      interest: visit.preference,
      lastContact: visit.visitDate,
      nextDue: visit.followUpDue,
      interactions: [],
      status: visit.interest as InterestLevel,
      createdAt: visit.visitDate,
    } : null;

    // Cascade: If source is Broker Ref or specific broker name, increment broker's leadsSent
    let updatedBrokers = state.brokers;
    if (visit.source === 'Broker Ref' || visit.source.startsWith('Broker: ')) {
      // If specific broker name provided (e.g., "Broker: John"), increment that broker
      const brokerName = visit.source.startsWith('Broker: ') ? visit.source.replace('Broker: ', '') : null;
      updatedBrokers = state.brokers.map(b => {
        if (b.status === 'Active') {
          if (brokerName) {
            if (b.name.toLowerCase() === brokerName.toLowerCase()) {
              return { ...b, leadsSent: b.leadsSent + 1 };
            }
            return b;
          }
          // Generic "Broker Ref" — increment first active broker
          return { ...b, leadsSent: b.leadsSent + 1 };
        }
        return b;
      });
    }

    return {
      siteVisits: [{ ...visit, id: newVisitId }, ...state.siteVisits],
      followUps: newFollowUp ? [newFollowUp, ...state.followUps] : state.followUps,
      brokers: updatedBrokers
    };
  }),

  followUps: initialFollowUps,
  addFollowUp: (f) => set((state) => ({
    followUps: [{ ...f, id: `f${Date.now()}`, interactions: [], createdAt: new Date().toISOString() }, ...state.followUps],
    unreadFollowUps: state.activeModule === 'followup' ? 0 : state.unreadFollowUps + 1
  })),
  addFollowUpInteraction: (id, interaction) => set((state) => {
    const followUp = state.followUps.find(f => f.id === id);
    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

    // Cascade: Update matching site visit's last-contacted date
    let updatedSiteVisits = state.siteVisits;
    if (followUp) {
      updatedSiteVisits = state.siteVisits.map(v => {
        if (v.customerName.toLowerCase() === followUp.customerName.toLowerCase() ||
          v.phone === followUp.phone) {
          return { ...v, visitDate: timestamp };
        }
        return v;
      });
    }

    return {
      followUps: state.followUps.map(f => {
        if (f.id === id) {
          const newInteraction = {
            ...interaction,
            id: `i${Date.now()}`,
            date: timestamp,
            loggedBy: 'Admin'
          };
          return {
            ...f,
            interactions: [newInteraction, ...f.interactions],
            lastContact: timestamp
          };
        }
        return f;
      }),
      siteVisits: updatedSiteVisits
    };
  }),
  updateFollowUpStatus: (id, status) => set((state) => {
    const followUp = state.followUps.find(f => f.id === id);
    if (!followUp) return state;

    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // --- CASCADE: Status → Booked ---
    let updatedPayments = state.payments;
    let updatedPlots = state.plots;

    if (status === 'Booked') {
      const hasExistingPayment = state.payments.some(
        p => p.customerName === followUp.customerName && p.bookingStatus === 'Active'
      );
      if (!hasExistingPayment) {
        const linkedPlot = state.plots.find(p =>
          p.customerName && p.customerName.toLowerCase() === followUp.customerName.toLowerCase()
        );
        const newPayment: Payment = {
          id: `p${Date.now()}`,
          customerName: followUp.customerName,
          plotId: linkedPlot?.id || 'TBD',
          date: timestamp,
          amount: 0,
          mode: 'Bank Transfer',
          installmentRatio: 'Booking Amount',
          balanceDue: linkedPlot ? (linkedPlot.size || 0) * (linkedPlot.rate || 0) : 0,
          status: 'Pending',
          receiptNumber: `BK-${Date.now().toString().slice(-4)}`,
          bookingStatus: 'Active'
        };
        updatedPayments = [newPayment, ...state.payments];
      }

      updatedPlots = state.plots.map(p => {
        if (p.customerName &&
          p.customerName.toLowerCase() === followUp.customerName.toLowerCase() &&
          p.status !== 'Booked' && p.status !== 'Sold') {
          return {
            ...p,
            status: 'Booked' as PlotStatus,
            bookingDate: timestamp,
            amountPaid: 0
          };
        }
        return p;
      });
    }

    // --- CASCADE: Status → Lost ---
    if (status === 'Lost') {
      updatedPayments = state.payments.map(p => {
        if (p.customerName.toLowerCase() === followUp.customerName.toLowerCase() && p.status === 'Pending' && p.bookingStatus === 'Active') {
          return { ...p, bookingStatus: 'Cancelled' as const };
        }
        return p;
      });

      updatedPlots = state.plots.map(p => {
        if (p.customerName &&
          p.customerName.toLowerCase() === followUp.customerName.toLowerCase() &&
          p.status === 'Booked') {
          return {
            ...p,
            status: 'Available' as PlotStatus,
            customerName: undefined,
            bookingDate: undefined,
            amountPaid: undefined
          };
        }
        return p;
      });
    }

    return {
      followUps: state.followUps.map(f => f.id === id ? { ...f, status } : f),
      payments: updatedPayments,
      plots: updatedPlots,
    };
  }),

  brokers: initialBrokers,
  addBroker: (b) => set((state) => ({
    brokers: [{
      ...b,
      id: `b${Date.now()}`,
      leadsSent: 0,
      conversions: 0,
      totalCommissionEarned: 0,
      pendingCommission: 0,
      status: 'Active',
      commissions: []
    }, ...state.brokers]
  })),
  updateBrokerStatus: (id, status) => set((state) => ({
    brokers: state.brokers.map(b => b.id === id ? { ...b, status: status as 'Active' | 'Inactive' } : b)
  })),
  markCommissionPaid: (brokerId, commissionId) => set((state) => ({
    brokers: state.brokers.map(b => {
      if (b.id !== brokerId) return b;
      const updatedCommissions = b.commissions.map(c =>
        c.id === commissionId ? { ...c, status: 'Paid' as const } : c
      );
      const pending = updatedCommissions.filter(c => c.status === 'Due').reduce((acc, curr) => acc + curr.amount, 0);
      const earned = updatedCommissions.filter(c => c.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
      return { ...b, commissions: updatedCommissions, pendingCommission: pending, totalCommissionEarned: earned };
    })
  })),

  weekendPosts: initialWeekendPosts,
  transmissionLogs: initialTransmissionLogs,
  weekendRules: initialWeekendRules,
  uploadedCsvs: initialUploadedCsvs,

  deployWeekendPost: (postData) => set((state) => ({
    weekendPosts: [{ ...postData, id: `w${Date.now()}`, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }, ...state.weekendPosts]
  })),
  deleteWeekendPost: (id) => set((state) => ({
    weekendPosts: state.weekendPosts.filter(p => p.id !== id)
  })),

  updateWeekendRule: (id, enabled) => set((state) => ({
    weekendRules: state.weekendRules.map(r => r.id === id ? { ...r, enabled } : r)
  })),

  logWeekendPost: (post) => set((state) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return {
      ...state,
      weekendPosts: [{ ...post, id: `w${Date.now()}`, date: timestamp }, ...state.weekendPosts]
    };
  }),

  // Send weekend post to CSV contacts
  sendWeekendPostToCsvContacts: (postTitle, contacts) => set((state) => {
    // Check if Customers Group is enabled
    const customersGroupEnabled = state.weekendRules.find(r => r.id === 'r4')?.enabled ?? true;

    // Filter out customers whose follow-up status is 'Lost' to avoid messaging uninterested contacts
    const lostCustomerNames = new Set(
      state.followUps.filter(f => f.status === 'Lost').map(f => f.customerName.toLowerCase())
    );
    const filteredContacts = contacts.filter(c =>
      !lostCustomerNames.has(String(c).toLowerCase())
    );

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

    const logEntry: TransmissionLog = {
      id: `tl${Date.now()}`,
      postTitle: postTitle,
      delivered: filteredContacts.length,
      read: 0,
      channel: 'WhatsApp' as const,
      date: timestamp
    };

    // Cascade: Auto-log follow-up interaction for each matching customer (if Customers Group enabled)
    let updatedFollowUps = state.followUps;
    if (customersGroupEnabled) {
      updatedFollowUps = state.followUps.map(f => {
        // Skip lost customers
        if (f.status === 'Lost') return f;

        // Check if this customer is in the contact list
        const isContact = filteredContacts.some(c =>
          String(c).toLowerCase() === f.customerName.toLowerCase() ||
          String(c).toLowerCase() === f.phone.toLowerCase()
        );
        if (!isContact) return f;

        const newInteraction: Interaction = {
          id: `i${Date.now()}-${f.id}`,
          type: 'WhatsApp',
          date: fullTimestamp,
          outcome: 'N/A',
          notes: `Weekend post sent: ${postTitle}`,
          loggedBy: 'System'
        };
        return {
          ...f,
          interactions: [newInteraction, ...f.interactions],
          lastContact: fullTimestamp
        };
      });
    }

    return {
      ...state,
      transmissionLogs: [logEntry, ...state.transmissionLogs],
      followUps: updatedFollowUps
    };
  }),

  // Send weekend post to active brokers only (filters out inactive)
  sendWeekendPostToBrokers: (postTitle) => set((state) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const activeBrokers = state.brokers.filter(b => b.status === 'Active');

    if (activeBrokers.length === 0) return state;

    const logEntry: TransmissionLog = {
      id: `tl${Date.now()}`,
      postTitle: `${postTitle} [Brokers]`,
      delivered: activeBrokers.length,
      read: 0,
      channel: 'WhatsApp' as const,
      date: timestamp
    };

    // Cascade: Update last-contacted date for each active broker
    const updatedBrokers = state.brokers.map(b => {
      if (b.status === 'Active') {
        return { ...b, lastContact: fullTimestamp };
      }
      return b;
    });

    return {
      transmissionLogs: [logEntry, ...state.transmissionLogs],
      brokers: updatedBrokers
    };
  }),

  addUploadedCsv: (csv) => set((state) => ({
    uploadedCsvs: [{ ...csv, id: `csv${Date.now()}`, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }, ...state.uploadedCsvs]
  })),

  deleteUploadedCsv: (id) => set((state) => ({
    uploadedCsvs: state.uploadedCsvs.filter(c => c.id !== id)
  })),

  lands: initialLands,
  addLand: (land) => set((state) => {
    const landId = `l-${Math.random().toString(36).substr(2, 9)}`;
    const newLand = { ...land, id: landId };
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

    const newPropertyHolder: PropertyHolder = {
      id: `ph-${Math.random().toString(36).substr(2, 9)}`,
      name: land.ownerName,
      parcelId: land.surveyNo,
      totalAmount: land.purchasePrice,
      paidAmount: 0,
      installments: [
        { id: `phi-${Math.random().toString(36).substr(2, 9)}`, installmentName: 'Advance', dueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), amount: land.purchasePrice * 0.1, condition: 'On agreement', status: 'Upcoming' },
        { id: `phi-${Math.random().toString(36).substr(2, 9)}`, installmentName: 'Registration Payment', dueDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), amount: land.purchasePrice * 0.9, condition: 'On registration', status: 'Upcoming' }
      ]
    };

    // Activity feed entries for schedule
    const scheduleItems: ActivityFeedItem[] = [
      {
        id: `af${Date.now()}-sched1`,
        message: `Installment schedule added: ${land.location} — Advance ₹${(land.purchasePrice * 0.1).toLocaleString('en-IN')} due ${newPropertyHolder.installments[0].dueDate}`,
        type: 'land_schedule',
        priority: 'low',
        read: false,
        timestamp: fullTimestamp
      },
      {
        id: `af${Date.now()}-sched2`,
        message: `Upcoming: ₹${(land.purchasePrice * 0.9).toLocaleString('en-IN')} to ${land.ownerName} for ${land.location} due ${newPropertyHolder.installments[1].dueDate}`,
        type: 'land_schedule',
        priority: 'low',
        read: false,
        timestamp: fullTimestamp
      }
    ];

    return {
      lands: [newLand, ...state.lands],
      propertyHolders: [newPropertyHolder, ...state.propertyHolders],
      activityFeed: [...scheduleItems, ...state.activityFeed]
    };
  }),
  updateLandStatus: (id, status) => set((state) => ({
    lands: state.lands.map(l => l.id === id ? { ...l, status } : l)
  })),
  addLandDoc: (landId, doc) => set((state) => ({
    lands: state.lands.map(l => l.id === landId ? { ...l, docs: [...l.docs, doc] } : l)
  })),
  addLandPayment: (landId, paymentData) => set((state) => {
    const targetLand = state.lands.find(l => l.id === landId);
    if (!targetLand) return state;

    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Auto-generate ID if missing
    const payment = { 
      ...paymentData, 
      id: (paymentData as any).id || `lp${Date.now()}`,
      balance: (paymentData as any).balance || 0 // Ensure balance exists for audit
    };

    // Find corresponding PropertyHolder
    const holder = state.propertyHolders.find(h => h.parcelId === targetLand.surveyNo);

    let updatedPropertyHolders = state.propertyHolders;
    if (holder) {
      const nextInstallment = holder.installments.find(i => i.status !== 'Paid');
      // Always update paidAmount on holder
      updatedPropertyHolders = state.propertyHolders.map(h =>
        h.id === holder.id ? {
          ...h,
          paidAmount: h.paidAmount + payment.amount,
          ...(nextInstallment ? {
            installments: h.installments.map(i =>
              i.id === nextInstallment.id ? { ...i, status: 'Paid', paidDate: payment.date } : i
            )
          } : {})
        } : h
      );
    }

    // Activity feed entry
    const feedItem: ActivityFeedItem = {
      id: `af${Date.now()}-land`,
      message: `₹${payment.amount.toLocaleString('en-IN')} (${payment.mode === 'Cash' ? 'Cash' : 'Bank'}) paid to ${targetLand.ownerName} for ${targetLand.location}`,
      type: 'land_payment',
      priority: 'medium',
      read: false,
      timestamp: fullTimestamp
    };

    return {
      lands: state.lands.map(l => l.id === landId ? { ...l, payments: [...(l.payments || []), payment as any], paidTillDate: (l.paidTillDate || 0) + payment.amount } : l),
      propertyHolders: updatedPropertyHolders,
      activityFeed: [feedItem, ...state.activityFeed]
    };
  }),




  layouts: initialLayouts,
  addLayout: (layout) => set((state) => {
    const id = `l${state.layouts.length + 1}`;
    const newLayout = { ...layout, id, docs: [] };
    // Generate empty plots for this layout
    const newPlots: Plot[] = Array.from({ length: layout.totalPlots }, (_, i) => ({
      id: `${layout.name.charAt(0)}-${(i + 1).toString().padStart(2, '0')}`,
      layoutId: id,
      size: Number(layout.plotSizes.split(',')[0]) || 150,
      rate: layout.ratePerSqYd,
      status: 'Available' as PlotStatus
    }));

    // Cascade: Auto-create construction block for new scheme
    const newBlock: ConstructionBlock = {
      id: `cb${Date.now()}`,
      name: layout.name,
      range: `Plots 1-${layout.totalPlots}`,
      progress: 0,
      colorVar: '--gold'
    };

    // Cascade: Auto-create default construction phases for new scheme
    const defaultPhases: ConstructionPhase[] = [
      { id: `cp${Date.now()}-1`, name: `${layout.name} — Land Clearing`, progress: 0, targetDate: 'TBD', status: 'Not Started', colorVar: '--green', reports: [], photos: [] },
      { id: `cp${Date.now()}-2`, name: `${layout.name} — Road & Drainage`, progress: 0, targetDate: 'TBD', status: 'Not Started', colorVar: '--gold', reports: [], photos: [] },
      { id: `cp${Date.now()}-3`, name: `${layout.name} — Plot Demarcation`, progress: 0, targetDate: 'TBD', status: 'Not Started', colorVar: '--blue', reports: [], photos: [] },
    ];

    return {
      layouts: [...state.layouts, newLayout],
      plots: [...state.plots, ...newPlots],
      constructionBlocks: [...state.constructionBlocks, newBlock],
      constructionPhases: [...state.constructionPhases, ...defaultPhases]
    };
  }),
  addLayoutDoc: (layoutId, doc) => set((state) => ({
    layouts: state.layouts.map(l => l.id === layoutId ? { ...l, docs: [...(l.docs || []), doc] } : l)
  })),
  plots: initialPlots,
  updatePlotStatus: (id, status, customerName, amount) => set((state) => {
    const plot = state.plots.find(p => p.id === id);
    if (!plot) return state;

    const plotValue = (plot.size || 0) * (plot.rate || 0);
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // --- CASCADE: Book a Plot ---
    if (status === 'Booked' && plot.status !== 'Booked') {
      // Auto-create Payment with plot number, customer name, total plot value
      const bookingPayment: Payment = {
        id: `p${Date.now()}`,
        customerName: customerName || plot.customerName || 'Walk-in Customer',
        plotId: id,
        date: timestamp,
        amount: amount || 0,
        mode: 'Bank Transfer',
        installmentRatio: 'Booking Amount',
        balanceDue: plotValue,
        status: 'Pending',
        receiptNumber: `BK-${Date.now().toString().slice(-4)}`,
        bookingStatus: 'Active'
      };

      // Auto-update FollowUp status to 'Booked' if customer exists
      const customerPhone = customerName || plot.customerName || '';
      const updatedFollowUps = state.followUps.map(f => {
        if (f.customerName.toLowerCase() === customerPhone.toLowerCase() ||
          f.customerName.toLowerCase() === (customerName || '').toLowerCase()) {
          return { ...f, status: 'Booked' as const };
        }
        return f;
      });

      return {
        plots: state.plots.map(p => p.id === id ? {
          ...p,
          status: 'Booked' as PlotStatus,
          customerName: customerName || p.customerName,
          bookingDate: timestamp,
          amountPaid: amount || p.amountPaid
        } : p),
        payments: [bookingPayment, ...state.payments],
        followUps: updatedFollowUps
      };
    }

    // --- CASCADE: Mark Plot as Sold ---
    if (status === 'Sold' && plot.status !== 'Sold') {
      const salePayment: Payment = {
        id: `p${Date.now()}`,
        customerName: customerName || plot.customerName || 'Walk-in Customer',
        plotId: id,
        date: timestamp,
        amount: plotValue,
        mode: 'Bank Transfer',
        installmentRatio: 'Full Sale',
        balanceDue: 0,
        status: 'Complete',
        receiptNumber: `SL-${Date.now().toString().slice(-4)}`,
        bookingStatus: 'Active'
      };

      // Cascade: If booking came via a broker, calculate commission
      const updatedBrokers = state.brokers.map(broker => {
        if (broker.status === 'Active' && broker.leadsSent > 0) {
          const rateStr = broker.commissionRate.replace('%', '');
          const rate = parseFloat(rateStr) / 100 || 0.015;
          const commissionAmt = Math.round(plotValue * rate);
          const newCommission: CommissionRecord = {
            id: `cr${Date.now()}`,
            plotNumber: id,
            customerName: customerName || plot.customerName || '',
            amount: commissionAmt,
            status: 'Due',
            date: timestamp
          };
          return {
            ...broker,
            conversions: broker.conversions + 1,
            totalCommissionEarned: broker.totalCommissionEarned + commissionAmt,
            pendingCommission: broker.pendingCommission + commissionAmt,
            commissions: [...broker.commissions, newCommission]
          };
        }
        return broker;
      });

      // Check if plot already has an existing active payment (from booking), cancel old booking payment
      const updatedPayments = state.payments.map(p =>
        p.plotId === id && p.bookingStatus === 'Active' && p.status === 'Pending'
          ? { ...p, status: 'Complete' as const }
          : p
      );

      return {
        plots: state.plots.map(p => p.id === id ? {
          ...p,
          status: 'Sold' as PlotStatus,
          customerName: customerName || p.customerName,
          bookingDate: p.bookingDate || timestamp,
          amountPaid: plotValue
        } : p),
        payments: [salePayment, ...updatedPayments],
        brokers: updatedBrokers
      };
    }

    // --- CASCADE: Cancel Booking (Booked → Available) ---
    if (status === 'Available' && plot.status === 'Booked') {
      // Flag payment record as 'Booking Cancelled'
      const updatedPayments = state.payments.map(p =>
        p.plotId === id && p.bookingStatus === 'Active'
          ? { ...p, bookingStatus: 'Cancelled' as const }
          : p
      );

      // Revert FollowUp customer status to 'Active' so they can be re-pursued
      const plotCustomer = plot.customerName || customerName || '';
      const updatedFollowUps = state.followUps.map(f => {
        if (f.customerName.toLowerCase() === plotCustomer.toLowerCase() && f.status === 'Booked') {
          return { ...f, status: 'Warm' as const };
        }
        return f;
      });

      return {
        plots: state.plots.map(p => p.id === id ? {
          ...p,
          status: 'Available' as PlotStatus,
          customerName: undefined,
          bookingDate: undefined,
          amountPaid: undefined
        } : p),
        payments: updatedPayments,
        followUps: updatedFollowUps
      };
    }

    // Default: simple status update
    return {
      plots: state.plots.map(p => {
        if (p.id === id) {
          if (p.status === 'Sold' && status !== 'Sold') {
            console.warn('Cannot revert status of a Sold plot');
            return p;
          }
          return {
            ...p,
            status,
            customerName: customerName || p.customerName,
            bookingDate: status === 'Available' ? undefined : (p.bookingDate || timestamp),
            amountPaid: amount !== undefined ? amount : p.amountPaid
          };
        }
        return p;
      }),
      payments: state.payments,
    };
  }),
  updatePlotDimensions: (id: string, size: number, rate: number) => set((state) => ({
    plots: state.plots.map(p => p.id === id ? { ...p, size, rate } : p)
  })),
  updateSiteVisitStatus: (id: string, status: 'Scheduled' | 'Visited' | 'No Show') => set((state) => ({
    siteVisits: state.siteVisits.map(v => v.id === id ? { ...v, status } : v)
  })),
  deleteSiteVisit: (id: string) => set((state) => ({
    siteVisits: state.siteVisits.filter(v => v.id !== id)
  })),
  updateSiteVisit: (id: string, visitData: Partial<SiteVisit>) => set((state) => {
    const visit = state.siteVisits.find(v => v.id === id);
    const oldInterest = visit?.interest;
    const oldSource = visit?.source;

    // Cascade 1: If interest level changed, update matching follow-up status
    let updatedFollowUps = state.followUps;
    if (visitData.interest && visitData.interest !== oldInterest && visit) {
      updatedFollowUps = state.followUps.map(f => {
        if (f.customerName.toLowerCase() === visit.customerName.toLowerCase() ||
          f.phone === visit.phone) {
          return { ...f, status: visitData.interest as InterestLevel };
        }
        return f;
      });
    }

    // Cascade 2: If source changed to Broker Ref, increment broker leadsSent
    let updatedBrokers = state.brokers;
    if (visitData.source === 'Broker Ref' && oldSource !== 'Broker Ref') {
      updatedBrokers = state.brokers.map(b => {
        if (b.status === 'Active') {
          return { ...b, leadsSent: b.leadsSent + 1 };
        }
        return b;
      });
    }

    return {
      siteVisits: state.siteVisits.map(v => v.id === id ? { ...v, ...visitData } : v),
      followUps: updatedFollowUps,
      brokers: updatedBrokers
    };
  }),

  constructionPhases: initialConstructionPhases,
  updatePhaseProgress: (id, progress, status) => set((state) => {
    const phase = state.constructionPhases.find(p => p.id === id);
    const phaseName = phase?.name || '';

    // Auto-set status based on progress
    let autoStatus = status;
    if (progress === 100 && !status) autoStatus = 'Completed';
    else if (progress > 0 && progress < 100 && !status) autoStatus = 'In Progress';
    else if (progress === 0 && !status) autoStatus = 'Not Started';

    // Cascade: When progress → 100%, mark eligible property holder installments
    // Installments with conditions containing "completion" or phase name become eligible
    let updatedPropertyHolders = state.propertyHolders;
    if (progress === 100 && phase) {
      updatedPropertyHolders = state.propertyHolders.map(holder => ({
        ...holder,
        installments: holder.installments.map(inst => {
          if (inst.status !== 'Paid' &&
            (inst.condition.toLowerCase().includes('completion') ||
              inst.condition.toLowerCase().includes(phaseName.split('—')[1]?.trim().toLowerCase() || '___'))) {
            return { ...inst, status: 'Due in 10 days' as const };
          }
          return inst;
        })
      }));
    }

    return {
      constructionPhases: state.constructionPhases.map(p => p.id === id ? { ...p, progress, ...(autoStatus ? { status: autoStatus } : {}) } : p),
      propertyHolders: updatedPropertyHolders
    };
  }),
  addConstructionPhase: (phase) => set((state) => ({
    constructionPhases: [...state.constructionPhases, { ...phase, id: `p-${Math.random().toString(36).substr(2, 9)}`, reports: [], photos: [] }]
  })),
  deleteConstructionPhase: (id) => set((state) => ({
    constructionPhases: state.constructionPhases.filter(p => p.id !== id)
  })),
  addReport: (phaseId, report) => set((state) => {
    const phase = state.constructionPhases.find(p => p.id === phaseId);
    const phaseName = phase?.name || 'Unknown Phase';

    // Cascade: If report status is "In Review" or "Pending", add inspection alert for dashboard
    let newAlerts = state.inspectionAlerts;
    if (report.status === 'Pending' || report.status === 'In Review') {
      const alert: InspectionAlert = {
        id: `ia${Date.now()}`,
        phaseId,
        phaseName,
        observer: report.observer,
        status: report.status,
        date: report.date
      };
      newAlerts = [alert, ...state.inspectionAlerts];
    }

    return {
      constructionPhases: state.constructionPhases.map(p => p.id === phaseId ? {
        ...p,
        reports: [{ ...report, id: `r${Date.now()}` }, ...(p.reports || [])]
      } : p),
      inspectionAlerts: newAlerts
    };
  }),
  addPhoto: (phaseId, photo) => set((state) => ({
    constructionPhases: state.constructionPhases.map(p => p.id === phaseId ? {
      ...p,
      photos: [{ ...photo, id: `ph${Date.now()}` }, ...(p.photos || [])]
    } : p)
  })),

  constructionBlocks: initialConstructionBlocks,
  addConstructionBlock: (block) => set((state) => ({
    constructionBlocks: [...state.constructionBlocks, { ...block, id: `b-${Math.random().toString(36).substr(2, 9)}` }]
  })),
  deleteConstructionBlock: (id) => set((state) => ({
    constructionBlocks: state.constructionBlocks.filter(b => b.id !== id)
  })),
  updateBlockProgress: (id, progress) => set((state) => ({
    constructionBlocks: state.constructionBlocks.map(b => b.id === id ? { ...b, progress } : b)
  })),

  materialStock: initialMaterialStock,
  materialTxns: initialMaterialTxns,
  addMaterialTxn: (txn) => set((state) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const newTxn = { ...txn, id: `mt${Date.now()}`, date: txn.date || timestamp };

    // Update stock levels
    const updatedStock = state.materialStock.map(m => {
      if (m.name === txn.materialName) {
        const newQty = txn.type === 'Inward' ? m.current + txn.qty : Math.max(0, m.current - txn.qty);
        return {
          ...m,
          current: newQty,
          colorVar: newQty < m.threshold ? '--red' : (newQty < m.threshold * 1.5 ? '--amber' : '--blue'),
          statusText: newQty < m.threshold ? '⚠ Critical stock level' : (newQty < m.threshold * 1.5 ? '⚠ Reorder soon' : '')
        };
      }
      return m;
    });

    // Build activity feed entries
    const newFeedItems: ActivityFeedItem[] = [];

    if (txn.type === 'Inward') {
      newFeedItems.push({
        id: `af${Date.now()}-in`,
        message: `Material purchased: ${txn.qty} ${txn.unit} ${txn.materialName} from ${txn.vendorName || 'vendor'}`,
        type: 'material_inward',
        priority: 'low',
        read: false,
        timestamp: fullTimestamp
      });
    } else {
      newFeedItems.push({
        id: `af${Date.now()}-out`,
        message: `Material issued: ${txn.qty} ${txn.unit} ${txn.materialName} to ${txn.projectBlock || 'site'}`,
        type: 'material_outward',
        priority: 'low',
        read: false,
        timestamp: fullTimestamp
      });
    }

    // Check for low stock alerts after this transaction
    const affectedMaterial = updatedStock.find(m => m.name === txn.materialName);
    if (affectedMaterial && affectedMaterial.current < affectedMaterial.threshold) {
      newFeedItems.push({
        id: `af${Date.now()}-alert`,
        message: `${affectedMaterial.name} stock low — ${affectedMaterial.current} ${affectedMaterial.unit} remaining`,
        type: 'material_alert',
        priority: 'critical',
        read: false,
        timestamp: fullTimestamp
      });
    }

    // For outward entries linked to a project block, auto-link to matching construction phase
    let updatedPhases = state.constructionPhases;
    if (txn.type === 'Outward' && txn.projectBlock) {
      const matchingPhase = state.constructionPhases.find(p =>
        p.name.toLowerCase().includes(txn.projectBlock!.toLowerCase()) ||
        txn.projectBlock!.toLowerCase().includes(p.name.split('—')[1]?.trim().toLowerCase() || '___')
      );
      if (matchingPhase) {
        // Track material consumption on the phase via a report entry
        const materialReport = {
          id: `r${Date.now()}`,
          observer: txn.supervisorName || 'System',
          action: `Material consumed: ${txn.qty} ${txn.unit} ${txn.materialName}`,
          status: 'Cleared' as const,
          date: timestamp
        };
        updatedPhases = state.constructionPhases.map(p =>
          p.id === matchingPhase.id
            ? { ...p, reports: [materialReport, ...(p.reports || [])] }
            : p
        );
      }
    }

    return {
      materialTxns: [newTxn, ...state.materialTxns],
      materialStock: updatedStock,
      notifications: updatedStock.some(m => m.current < m.threshold) ? state.notifications + 1 : state.notifications,
      activityFeed: [...newFeedItems, ...state.activityFeed],
      constructionPhases: updatedPhases
    };
  }),

  addMaterial: (material) => set((state) => ({
    materialStock: [...state.materialStock, {
      ...material,
      id: `m${Date.now()}`,
      current: 0,
      statusText: 'No stock recorded'
    }]
  })),

  deleteMaterial: (id) => set((state) => ({
    materialStock: state.materialStock.filter(m => m.id !== id)
  })),

  updateMaterialThreshold: (id, threshold) => set((state) => ({
    materialStock: state.materialStock.map(m => {
      if (m.id !== id) return m;
      const newQty = m.current;
      return {
        ...m,
        threshold,
        colorVar: newQty < threshold ? '--red' : (newQty < threshold * 1.5 ? '--amber' : '--blue'),
        statusText: newQty < threshold ? '⚠ Critical stock level' : (newQty < threshold * 1.5 ? '⚠ Reorder soon' : '')
      };
    })
  })),

  assets: initialAssets,
  addAsset: (asset) => set((state) => {
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const newAsset = { ...asset, id: `a${Date.now()}` };

    const feedItem: ActivityFeedItem = {
      id: `af${Date.now()}`,
      message: `New asset registered: ${asset.name} (${asset.category}) — ₹${asset.price.toLocaleString('en-IN')}`,
      type: 'system',
      priority: 'low',
      read: false,
      timestamp: fullTimestamp
    };

    return {
      assets: [newAsset, ...state.assets],
      activityFeed: [feedItem, ...state.activityFeed]
    };
  }),
  updateAssetCondition: (id, condition) => set((state) => {
    const asset = state.assets.find(a => a.id === id);
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let newFeedItems: ActivityFeedItem[] = [];

    if (asset) {
      if (condition === 'Under Repair') {
        newFeedItems.push({
          id: `af${Date.now()}-repair`,
          message: `${asset.name} under repair since ${timestamp}`,
          type: 'system',
          priority: 'medium',
          read: false,
          timestamp: fullTimestamp
        });
      } else if (condition === 'Disposed') {
        newFeedItems.push({
          id: `af${Date.now()}-disposed`,
          message: `${asset.name} disposed — removed from active asset pool`,
          type: 'system',
          priority: 'low',
          read: false,
          timestamp: fullTimestamp
        });
      } else if (condition === 'Active' && asset.condition !== 'Active') {
        newFeedItems.push({
          id: `af${Date.now()}-active`,
          message: `${asset.name} restored to active status`,
          type: 'system',
          priority: 'medium',
          read: false,
          timestamp: fullTimestamp
        });
      }
    }

    return {
      assets: state.assets.map(a => a.id === id ? { ...a, condition: condition as AssetCondition } : a),
      activityFeed: newFeedItems.length > 0 ? [...newFeedItems, ...state.activityFeed] : state.activityFeed
    };
  }),
  updateAsset: (id, assetData) => set((state) => ({
    assets: state.assets.map(a => a.id === id ? { ...a, ...assetData } : a)
  })),
  deleteAsset: (id) => set((state) => ({
    assets: state.assets.filter(a => a.id !== id)
  })),

  payments: initialPayments,
  addPayment: (payment) => set((state) => {
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const pId = payment.plotId;

    // Activity feed entry
    const feedItem: ActivityFeedItem = {
      id: `af${Date.now()}-pay`,
      message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} received from ${payment.customerName} (${payment.mode === 'Cash' ? 'Cash' : 'White'})`,
      type: 'payment',
      priority: 'medium',
      read: false,
      timestamp: fullTimestamp
    };

    // Update plot amountPaid
    let updatedPlots = state.plots;
    let plotStatusChange: { plotId: string, newStatus: string } | null = null;
    const plot = state.plots.find(p => p.id === pId);
    if (plot) {
      const newAmountPaid = (plot.amountPaid || 0) + payment.amount;
      const totalPrice = plot.size * plot.rate;
      const isFullyPaid = newAmountPaid >= totalPrice;

      updatedPlots = state.plots.map(p => {
        if (p.id === pId) {
          const newStatus = isFullyPaid && p.status === 'Booked' ? 'Sold' as const : p.status;
          if (newStatus !== p.status) {
            plotStatusChange = { plotId: p.id, newStatus };
          }
          return { ...p, amountPaid: newAmountPaid, status: newStatus, ...(isFullyPaid && p.status === 'Booked' ? { bookingDate: p.bookingDate || timestamp } : {}) };
        }
        return p;
      });
    }

    // Additional feed items for plot status change
    let additionalFeedItems: ActivityFeedItem[] = [];
    let updatedBrokers = state.brokers;

    if (plotStatusChange) {
      additionalFeedItems.push({
        id: `af${Date.now()}-sold`,
        message: `Plot ${plot?.id} auto-updated to Sold — full payment received from ${payment.customerName}`,
        type: 'booking',
        priority: 'high',
        read: false,
        timestamp: fullTimestamp
      });

      // Check if there's a broker associated (via follow-ups)
      const relatedFollowUp = state.followUps.find(f =>
        f.customerName.toLowerCase() === payment.customerName.toLowerCase() && 
        ((f as any).source === 'Broker' || (f as any).source?.startsWith?.('Broker:')) && 
        (f as any).brokerName
      );
      if (relatedFollowUp && (relatedFollowUp as any).brokerName) {
        const broker = state.brokers.find(b => b.name === (relatedFollowUp as any).brokerName);


        if (broker) {
          const commission = payment.amount * 0.02; // 2% commission
          updatedBrokers = state.brokers.map(b =>
            b.id === broker.id ? {
              ...b,
              pendingCommission: b.pendingCommission + commission,
              totalCommissionEarned: b.totalCommissionEarned + commission
            } : b
          );
          additionalFeedItems.push({
            id: `af${Date.now()}-comm`,
            message: `Commission of ₹${commission.toLocaleString('en-IN')} triggered for broker ${broker.name}`,
            type: 'system',
            priority: 'medium',
            read: false,
            timestamp: fullTimestamp
          });
        }
      }
    }

    // Cascade: Auto-log interaction (Receipt type) in FollowUp
    const updatedFollowUps = state.followUps.map(f => {
      if (f.customerName.toLowerCase() === payment.customerName.toLowerCase() ||
          (pId && f.interest.toLowerCase() === pId.toLowerCase())) {
        const interaction: Interaction = {
          id: `i${Date.now()}`,
          type: 'Receipt' as InteractionType,
          outcome: 'N/A' as InteractionOutcome,
          notes: `Receipt: ₹${payment.amount.toLocaleString('en-IN')} Settled. Installment ${payment.installmentRatio || 'Registry'} recorded via ${payment.mode}`,
          date: fullTimestamp,
          loggedBy: 'System'
        };
        return { ...f, interactions: [interaction, ...f.interactions], lastContact: fullTimestamp };
      }
      return f;
    });

    const newPaymentObj: Payment = {
      ...payment,
      id: (payment as any).id || `p${Date.now()}`
    };

    return {
      payments: [newPaymentObj, ...state.payments],
      plots: updatedPlots,
      brokers: updatedBrokers,
      activityFeed: [feedItem, ...additionalFeedItems, ...state.activityFeed],
      followUps: updatedFollowUps
    };
  }),

  propertyHolders: initialPropertyHolders,
  markInstallmentPaid: (holderId, installmentId, paidDate) => set((state) => {
    const holder = state.propertyHolders.find(h => h.id === holderId);
    const installment = holder?.installments.find(i => i.id === installmentId);
    const amount = installment?.amount || 0;
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

    // Find the linked land parcel
    const linkedLand = state.lands.find(l => holder && l.surveyNo === holder.parcelId);

    // Activity feed entry
    let newFeedItems: ActivityFeedItem[] = [];
    if (holder && installment) {
      newFeedItems.push({
        id: `af${Date.now()}-land`,
        message: `₹${amount.toLocaleString('en-IN')} paid to ${holder.name} for ${linkedLand?.location || holder.parcelId} (${installment.installmentName})`,
        type: 'land_payment',
        priority: 'medium',
        read: false,
        timestamp: fullTimestamp
      });
    }

    return {
      propertyHolders: state.propertyHolders.map(h =>
        h.id === holderId ? {
          ...h,
          paidAmount: h.paidAmount + amount,
          installments: h.installments.map(i => i.id === installmentId ? { ...i, status: 'Paid' as const, paidDate: paidDate } : i)
        } : h
      ),
      // Sync paidTillDate on linked land
      lands: linkedLand ? state.lands.map(l =>
        l.id === linkedLand.id ? { ...l, paidTillDate: l.paidTillDate + amount } : l
      ) : state.lands,
      activityFeed: newFeedItems.length > 0 ? [...newFeedItems, ...state.activityFeed] : state.activityFeed
    };
  }),
  uploadInstallmentReceipt: (holderId, installmentId, url) => set((state) => ({
    propertyHolders: state.propertyHolders.map(h =>
      h.id === holderId ? {
        ...h,
        installments: h.installments.map(i => i.id === installmentId ? { ...i, receiptUrl: url } : i)
      } : h
    )
  })),
  addPropertyHolderInstallment: (holderId, installment) => set((state) => {
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const holder = state.propertyHolders.find(h => h.id === holderId);
    const linkedLand = holder ? state.lands.find(l => l.surveyNo === holder.parcelId) : undefined;

    const newFeedItem: ActivityFeedItem = {
      id: `af${Date.now()}-sched`,
      message: `New installment: ${installment.installmentName} ₹${installment.amount.toLocaleString('en-IN')} to ${holder?.name || 'owner'} for ${linkedLand?.location || 'land'} due ${installment.dueDate}`,
      type: 'land_schedule',
      priority: 'low',
      read: false,
      timestamp: fullTimestamp
    };

    return {
      propertyHolders: state.propertyHolders.map(ph => {
        if (ph.id === holderId) {
          return {
            ...ph,
            installments: [...ph.installments, { ...installment, id: `phi${Date.now()}` }]
          };
        }
        return ph;
      }),
      activityFeed: [newFeedItem, ...state.activityFeed]
    };
  }),

  salaries: initialSalaries,
  addSalary: (salary) => set((state) => ({
    salaries: [{ ...salary, id: `s${Date.now()}` }, ...state.salaries]
  })),
  updateSalaryStatus: (id, status) => set((state) => {
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const salary = state.salaries.find(s => s.id === id);
    let newFeedItems: ActivityFeedItem[] = [];
    if (salary && status === 'Paid') {
      newFeedItems.push({
        id: `af${Date.now()}-sal`,
        message: `Salary paid: ${salary.employeeName} — ₹${salary.net.toLocaleString('en-IN')} (${salary.month})`,
        type: 'system',
        priority: 'medium',
        read: false,
        timestamp: fullTimestamp
      });
    }
    const updatedAdvances = state.salaryAdvances.map(a => 
      a.employeeName === salary?.employeeName && !a.deducted 
        ? { ...a, deducted: true } 
        : a
    );
    return {
      salaries: state.salaries.map(s => s.id === id ? { ...s, status } : s),
      salaryAdvances: updatedAdvances,
      activityFeed: newFeedItems.length > 0 ? [...newFeedItems, ...state.activityFeed] : state.activityFeed
    };
  }),

  salaryAdvances: initialSalaryAdvances,
  addSalaryAdvance: (advance) => set((state) => {
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const newAdvance: SalaryAdvance = { ...advance, id: `sa${Date.now()}`, deducted: false };

    // Auto-deduct from next month's payroll for this employee
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonth = nextMonthDate.toLocaleString('default', { month: 'long' }) + ' ' + nextMonthDate.getFullYear();

    const updatedSalaries = state.salaries.map(s => {
      if (s.employeeName.toLowerCase() === advance.employeeName.toLowerCase() && s.month === nextMonth) {
        const newAdvanceDeduction = s.advanceDeduction + advance.amount;
        const newNet = s.basic + s.allowance - newAdvanceDeduction - s.otherDeduction;
        return { ...s, advanceDeduction: newAdvanceDeduction, net: newNet };
      }
      return s;
    });

    // Mark advance as deducted if a matching next-month salary exists
    const matchedSalary = state.salaries.find(s =>
      s.employeeName.toLowerCase() === advance.employeeName.toLowerCase() && s.month === nextMonth
    );
    const finalAdvance = matchedSalary ? { ...newAdvance, deducted: true } : newAdvance;

    // Activity feed entry
    const feedItem: ActivityFeedItem = {
      id: `af${Date.now()}-adv`,
      message: `Salary advance: ${advance.employeeName} — ₹${advance.amount.toLocaleString('en-IN')}${matchedSalary ? ` (auto-deducted from ${nextMonth})` : ''}`,
      type: 'system',
      priority: 'medium',
      read: false,
      timestamp: fullTimestamp
    };

    return {
      salaryAdvances: [finalAdvance, ...state.salaryAdvances],
      salaries: updatedSalaries,
      activityFeed: [feedItem, ...state.activityFeed]
    };
  }),
  processPayroll: (month) => set((state) => {
    const now = new Date();
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    const monthSalaries = state.salaries.filter(s => s.month === month);
    const totalPayroll = monthSalaries.reduce((acc, s) => acc + s.net, 0);

    const feedItem: ActivityFeedItem = {
      id: `af${Date.now()}-payroll`,
      message: `Payroll of ₹${totalPayroll.toLocaleString('en-IN')} processed for ${month}`,
      type: 'system',
      priority: 'high',
      read: false,
      timestamp: fullTimestamp
    };

    return {
      activityFeed: [feedItem, ...state.activityFeed]
    };
  }),

  brochures: initialBrochures,
  brochureShares: initialBrochureShares,
  logBrochureShare: (share) => set((state) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

    const newShare: BrochureShare = { ...share, id: `bs${Date.now()}`, date: timestamp };

    // Cascade 1: Auto-log follow-up interaction if customer exists in follow-ups
    const matchingFollowUp = state.followUps.find(f =>
      f.customerName.toLowerCase() === share.customerName.toLowerCase()
    );
    let updatedFollowUps = state.followUps;
    if (matchingFollowUp) {
      const newInteraction: Interaction = {
        id: `i${Date.now()}`,
        type: 'WhatsApp',
        date: fullTimestamp,
        outcome: 'N/A',
        notes: `${share.brochureTitle} (V${share.version}) sent via WhatsApp`,
        loggedBy: 'System'
      };
      updatedFollowUps = state.followUps.map(f =>
        f.id === matchingFollowUp.id
          ? { ...f, interactions: [newInteraction, ...f.interactions], lastContact: fullTimestamp }
          : f
      );
    }

    // Cascade 2: Update site visit last-contact date if customer exists
    const matchingVisit = state.siteVisits.find(v =>
      v.customerName.toLowerCase() === share.customerName.toLowerCase()
    );
    let updatedSiteVisits = state.siteVisits;
    if (matchingVisit) {
      updatedSiteVisits = state.siteVisits.map(v =>
        v.id === matchingVisit.id ? { ...v, visitDate: fullTimestamp } : v
      );
    }

    return {
      brochureShares: [newShare, ...state.brochureShares],
      followUps: updatedFollowUps,
      siteVisits: updatedSiteVisits
    };
  }),
  addBrochure: (brochure) => set((state) => {
    const id = `br${Date.now()}`;
    const newBr: Brochure = { ...brochure, id, lastShared: 'Never', sharedCount: 0, downloadCount: 0 };
    
    // Cascade: Auto-create weekend post for new brochure
    const newPost: WeekendPost = {
      id: `wp${Date.now()}`,
      title: `New Listing: ${brochure.title}`,
      type: 'Static',
      status: 'Scheduled',
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=800',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      attachedBrochureId: id
    };

    return {
      brochures: [newBr, ...state.brochures],
      weekendPosts: [newPost, ...state.weekendPosts]
    };
  }),
  updateBrochure: (id, data) => set((state) => ({
    brochures: state.brochures.map(b => b.id === id ? { ...b, ...data } : b)
  })),
  attachBrochureToWeekendPost: (postId, brochureId) => set((state) => ({
    weekendPosts: state.weekendPosts.map(p => p.id === postId ? { ...p, attachedBrochureId: brochureId } : p)
  })),

  campaigns: initialCampaigns,
  addCampaign: (campaign) => set((state) => ({
    campaigns: [{ ...campaign, id: `c${Date.now()}` }, ...state.campaigns]
  })),

  constructionCosts: initialConstructionCosts,
  addConstructionCost: (cost) => set((state) => {
    const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newCost: ConstructionCost = { ...cost, id: `cc${Date.now()}`, date: timestamp };

    // Cascade: If cost is linked to material, auto-create outward entry
    let newTxns = state.materialTxns;
    let updatedStock = state.materialStock;
    if (cost.category === 'Material' && cost.materialName && cost.materialQty) {
      const material = state.materialStock.find(m => m.name === cost.materialName);
      const outwardTxn: MaterialTransaction = {
        id: `mt${Date.now()}`,
        materialName: cost.materialName,
        type: 'Outward',
        qty: cost.materialQty,
        unit: material?.unit || 'units',
        date: timestamp,
        projectBlock: cost.phaseName,
        supervisorName: 'Auto-dispatched'
      };
      newTxns = [outwardTxn, ...state.materialTxns];

      // Update stock levels
      updatedStock = state.materialStock.map(m => {
        if (m.name === cost.materialName) {
          const newQty = m.current - (cost.materialQty || 0);
          return {
            ...m,
            current: Math.max(0, newQty),
            colorVar: newQty < m.threshold ? '--red' : (newQty < m.threshold * 1.5 ? '--amber' : '--blue'),
            statusText: newQty < m.threshold ? '⚠ Critical stock level' : (newQty < m.threshold * 1.5 ? '⚠ Reorder soon' : '')
          };
        }
        return m;
      });
    }

    return {
      constructionCosts: [newCost, ...state.constructionCosts],
      materialTxns: newTxns,
      materialStock: updatedStock
    };
  }),

  inspectionAlerts: initialInspectionAlerts,

  activityFeed: initialActivityFeed,
  addActivityFeedItem: (item) => set((state) => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    return {
      activityFeed: [{ ...item, id: `af${Date.now()}`, timestamp, read: false }, ...state.activityFeed],
      notifications: item.priority === 'critical' ? state.notifications + 1 : state.notifications
    };
  }),
  markAllNotificationsRead: () => set((state) => ({
    activityFeed: state.activityFeed.map(item => ({ ...item, read: true }))
  })),
  clearActivityFeed: () => set({ activityFeed: [] }),

  sendWeekendPostNow: (postTitle, contactCount) => set((state) => {
    const customersGroupEnabled = state.weekendRules.find(r => r.id === 'r4')?.enabled ?? true;
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

    // 1. Create transmission log
    const logEntry: TransmissionLog = {
      id: `tl${Date.now()}`,
      postTitle,
      delivered: contactCount,
      read: 0,
      channel: 'WhatsApp',
      date: timestamp
    };

    // 2. Auto-log follow-up interactions for each matching customer (if Sync Loop enabled)
    let updatedFollowUps = state.followUps;
    if (customersGroupEnabled) {
      updatedFollowUps = state.followUps.map(f => {
        // Live Sync: Only send to nodes older than 21 days (Mature Leads)
        if (!f.createdAt || f.status === 'Lost') return f;
        
        const created = new Date(f.createdAt);
        const diffDays = Math.ceil(Math.abs(now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 21) return f; // Active Lead: Handled by manual follow-ups

        const newInteraction: Interaction = {
          id: `i${Date.now()}-${f.id}`,
          type: 'WhatsApp',
          date: fullTimestamp,
          outcome: 'N/A',
          notes: `[Live Sync] Weekend dispatch: ${postTitle}`,
          loggedBy: 'System'
        };
        return {
          ...f,
          interactions: [newInteraction, ...f.interactions],
          lastContact: fullTimestamp
        };
      });
    }

    // 3. Update broker last-contacted dates for active brokers
    const updatedBrokers = state.brokers.map(b => {
      if (b.status === 'Active') {
        return { ...b, lastContact: fullTimestamp };
      }
      return b;
    });

    // 4. Add activity feed entry
    const feedItem: ActivityFeedItem = {
      id: `af${Date.now()}`,
      message: `Weekend post sent to ${contactCount} contacts`,
      type: 'weekend_post',
      priority: 'low',
      read: false,
      timestamp: fullTimestamp
    };

    return {
      transmissionLogs: [logEntry, ...state.transmissionLogs],
      followUps: updatedFollowUps,
      brokers: updatedBrokers,
      activityFeed: [feedItem, ...state.activityFeed]
    };
  }),
}));
