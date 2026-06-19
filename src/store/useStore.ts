import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Type Definitions ---
export type LeadSource = 'Meta Ad' | 'Website' | 'Walk-in' | 'Broker' | 'Referral';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Site Visit Scheduled' | 'Negotiation' | 'Booking' | 'Won' | 'Lost' | 'In Progress' | 'Converted';
export type PaymentMode = 'Bank Transfer' | 'Cheque' | 'Cash';

export interface Query {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  interest: string;
  budget: string;
  message?: string;
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
  installmentName?: string;
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
  attachedCsvId?: string;
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

export type PropertyStatus = 'Available' | 'Booked' | 'Sold' | 'Hold';
export type PropertyType = 'Plot' | 'Villa' | 'Flat' | 'Shop';
export interface Property {
  id: string;
  propertyNo: string;
  projectName: string;
  type: PropertyType;
  block: string;
  facing: 'East' | 'West' | 'North' | 'South' | 'Corner';
  area: number;
  rate: number;
  status: PropertyStatus;
  customerName?: string;
  bookingDate?: string;
  notes?: string;
  floor?: string;
  bhk?: string;
}

export type LabourCategory = 'RCC Contractor' | 'Plumbing Agency' | 'Electrical Labour' | 'Masonry' | 'Tiles Labour' | 'Window & Section Labour' | 'Fire Labour' | 'Lift Material + Installation' | 'Color Labour' | 'Painting' | 'POP / Gypsum' | 'Fabrication' | 'Other';
export type LabourStatus = 'Active' | 'On Hold' | 'Completed' | 'Inactive';
export interface LabourAgency {
  id: string;
  agencyName: string;
  category: LabourCategory;
  contactPerson: string;
  phone: string;
  assignedSite: string;
  supervisorName: string;
  workerCount: number;
  rateType: 'Per SqFt' | 'Per Day' | 'Contract' | 'Per Point' | 'Per Unit';
  rate: number;
  totalContract: number;
  paidAmount: number;
  startDate: string;
  nextPaymentDate: string;
  status: LabourStatus;
  qualityRating: 'Good' | 'Average' | 'Needs Attention';
  notes?: string;
  details?: Record<string, any>;
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

export interface PropertyHolderPayment {
  id: string;
  date: string;
  amount: number;
  mode: 'White' | 'Cash';
  balance: number;
}

export interface PropertyHolder {
  id: string;
  name: string;
  parcelId: string;
  totalAmount: number;
  paidAmount: number;
  installments: PropertyHolderInstallment[];
  payments: PropertyHolderPayment[];
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

export interface ActivityFeedItem {
  id: string;
  message: string;
  type: 'weekend_post' | 'booking' | 'payment' | 'followup' | 'system' | 'material_inward' | 'material_outward' | 'material_alert' | 'staff_alert';
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
  systemPin: string;
  setSystemPin: (pin: string) => void;
  unreadFollowUps: number;
  notifications: number;
  unreadQueries: number;

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
  deployWeekendPost: (post: Omit<WeekendPost, 'id' | 'date'>) => void;
  deleteWeekendPost: (id: string) => void;
  logWeekendPost: (post: Omit<WeekendPost, 'id' | 'date'>) => void;
  sendWeekendPostToBrokers: (postTitle: string) => void;
  sendWeekendPostToCsvContacts: (postTitle: string, contacts: any[]) => void;
  sendWeekendPostNow: (postTitle: string, contactCount: number, contactIdentifiers?: string[]) => void;
  weekendRules: WeekendRule[];
  updateWeekendRule: (id: string, enabled: boolean) => void;

  properties: Property[];
  addProperty: (property: Omit<Property, 'id'>) => void;
  addProperties: (properties: Omit<Property, 'id'>[]) => void;
  updatePropertyStatus: (id: string, status: PropertyStatus, customerName?: string) => void;
  updateProperty: (id: string, propertyData: Partial<Property>) => void;

  labourAgencies: LabourAgency[];
  addLabourAgency: (agency: Omit<LabourAgency, 'id'>) => void;
  updateLabourStatus: (id: string, status: LabourStatus) => void;

  materialStock: MaterialStock[];
  materialTxns: MaterialTransaction[];
  addMaterialTxn: (txn: Omit<MaterialTransaction, 'id'>) => void;
  addMaterial: (material: Omit<MaterialStock, 'id' | 'current' | 'statusText'>) => void;
  deleteMaterial: (id: string) => void;
  updateMaterialThreshold: (id: string, threshold: number) => void;

  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAssetCondition: (id: string, condition: AssetCondition) => void;

  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;

  propertyHolders: PropertyHolder[];
  markInstallmentPaid: (holderId: string, installmentId: string, paidDate: string) => void;
  uploadInstallmentReceipt: (holderId: string, installmentId: string, url: string) => void;
  addPropertyHolderInstallment: (holderId: string, installment: Omit<PropertyHolderInstallment, 'id'>) => void;
  addPropertyHolderPayment: (holderId: string, payment: Omit<PropertyHolderPayment, 'id'>) => void;

  salaries: SalaryRecord[];
  addSalary: (salary: Omit<SalaryRecord, 'id'>) => void;
  updateSalaryStatus: (id: string, status: 'Paid' | 'Pending') => void;

  salaryAdvances: SalaryAdvance[];
  addSalaryAdvance: (advance: Omit<SalaryAdvance, 'id' | 'deducted'>) => void;
  processPayroll: (month: string) => void;

  campaigns: MarketingCampaign[];
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => void;

  activityFeed: ActivityFeedItem[];
  addActivityFeedItem: (item: Omit<ActivityFeedItem, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  clearActivityFeed: () => void;
  uploadedCsvs: UploadedCsv[];
  addUploadedCsv: (csv: Omit<UploadedCsv, 'id' | 'date'>) => void;
  deleteUploadedCsv: (id: string) => void;
  resetSystem: () => void;
}

const initialQueries: Query[] = [];
const initialPayments: Payment[] = [];
const initialPropertyHolders: PropertyHolder[] = [];
const initialSalaries: SalaryRecord[] = [];
const initialSalaryAdvances: SalaryAdvance[] = [];
const initialCampaigns: MarketingCampaign[] = [];
const initialSiteVisits: SiteVisit[] = [];
const initialFollowUps: FollowUp[] = [];
const initialBrokers: Broker[] = [];
const initialTransmissionLogs: TransmissionLog[] = [];
const initialWeekendRules: WeekendRule[] = [];
const initialWeekendPosts: WeekendPost[] = [];
const initialProperties: Property[] = [];
const initialLabourAgencies: LabourAgency[] = [];
const initialMaterialStock: MaterialStock[] = [];
const initialMaterialTxns: MaterialTransaction[] = [];
const initialAssets: Asset[] = [];
const initialUploadedCsvs: UploadedCsv[] = [];
const initialActivityFeed: ActivityFeedItem[] = [];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      activeModule: 'dashboard',
      setActiveModule: (m) => set((state) => ({
        activeModule: m,
        ...(m === 'query' ? { unreadQueries: 0 } : {}),
        ...(m === 'followup' ? { unreadFollowUps: 0 } : {})
      })),

      isPinUnlocked: false,
      systemPin: '1234',
      globalModal: null,
      setPinUnlocked: (v) => set({ isPinUnlocked: v }),
      setSystemPin: (pin) => set({ systemPin: pin }),
      setGlobalModal: (m) => set({ globalModal: m }),
      unlockPin: (pin: string) => {
        const currentPin = get().systemPin || '1234';
        const isMatch = pin === currentPin;
        if (isMatch) {
          set({ isPinUnlocked: true });
        }
        return isMatch;
      },
      lockPin: () => set({ isPinUnlocked: false }),

      unreadFollowUps: 0,
      notifications: 0,
      unreadQueries: 0,

      // --- Mock DB State ---
      queries: initialQueries,
      siteVisits: initialSiteVisits,
      followUps: initialFollowUps,
      brokers: initialBrokers,
      weekendPosts: initialWeekendPosts,
      transmissionLogs: initialTransmissionLogs,
      weekendRules: initialWeekendRules,
      uploadedCsvs: initialUploadedCsvs,
      properties: initialProperties,
      labourAgencies: initialLabourAgencies,
      materialStock: initialMaterialStock,
      materialTxns: initialMaterialTxns,
      assets: initialAssets,
      payments: initialPayments,
      propertyHolders: initialPropertyHolders,
      salaries: initialSalaries,
      salaryAdvances: initialSalaryAdvances,
      campaigns: initialCampaigns,
      activityFeed: initialActivityFeed,

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
        if (!query) return {};
        const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        let updatedFollowUps = state.followUps;
        let updatedSiteVisits = state.siteVisits;
        let updatedProperties = state.properties;
        let updatedPayments = state.payments;
        let updatedActivityFeed = state.activityFeed;

        // FollowUp sync
        let followUp = state.followUps.find(f => f.phone === query.phone);
        if (!followUp && status !== 'Lost') {
          const newFollowUp: FollowUp = {
            id: `f-${Math.random().toString(36).substr(2, 9)}`,
            customerName: query.name,
            phone: query.phone,
            interest: query.interest,
            lastContact: timestamp,
            nextDue: 'Tomorrow',
            interactions: [],
            status: status === 'Won' ? 'Booked' : 'Warm',
            createdAt: timestamp,
            source: query.source
          };
          updatedFollowUps = [newFollowUp, ...state.followUps];
          followUp = newFollowUp;
        } else if (followUp) {
          updatedFollowUps = state.followUps.map(f => {
            if (f.phone === query.phone) {
              return {
                ...f,
                status: status === 'Won' ? 'Booked' : status === 'Lost' ? 'Lost' : f.status
              };
            }
            return f;
          });
        }

        // Cascade 1: Site Visit Scheduled
        if (status === 'Site Visit Scheduled' && !state.siteVisits.some(v => v.phone === query.phone)) {
          const newVisit: SiteVisit = {
            id: `v-${Math.random().toString(36).substr(2, 9)}`,
            customerName: query.name,
            phone: query.phone,
            visitDate: timestamp,
            source: query.source,
            budget: query.budget,
            preference: query.interest,
            interest: 'Hot',
            followUpDue: 'Tomorrow',
            status: 'Scheduled',
            notes: 'Site visit scheduled via deals board pipeline.'
          };
          updatedSiteVisits = [newVisit, ...state.siteVisits];

          const activityItem: ActivityFeedItem = {
            id: `act-${Date.now()}`,
            message: `Scheduled site visit for ${query.name} to view ${query.interest}`,
            type: 'followup',
            priority: 'medium',
            read: false,
            timestamp: new Date().toISOString()
          };
          updatedActivityFeed = [activityItem, ...state.activityFeed];
        }

        // Cascade 2: Won
        if (status === 'Won') {
          const queryInterest = query.interest.trim().toLowerCase();
          const matchingProperty = state.properties.find(p =>
            p.propertyNo.toLowerCase() === queryInterest ||
            p.propertyNo.toLowerCase() === `property ${queryInterest}` ||
            `property ${p.propertyNo.toLowerCase()}` === queryInterest
          );

          if (matchingProperty && matchingProperty.status === 'Available') {
            const propertyValue = (matchingProperty.area || 0) * (matchingProperty.rate || 0);

            updatedProperties = state.properties.map(p => {
              if (p.id === matchingProperty.id) {
                return {
                  ...p,
                  status: 'Booked' as PropertyStatus,
                  customerName: query.name,
                  bookingDate: timestamp
                };
              }
              return p;
            });

            const bookingPayment: Payment = {
              id: `p${Date.now()}`,
              customerName: query.name,
              plotId: matchingProperty.propertyNo,
              date: timestamp,
              amount: 0,
              mode: 'Bank Transfer',
              installmentRatio: 'Booking Amount',
              installmentName: 'Booking Amount',
              balanceDue: propertyValue,
              status: 'Pending',
              receiptNumber: `BK-${Date.now().toString().slice(-4)}`,
              bookingStatus: 'Active'
            };
            updatedPayments = [bookingPayment, ...state.payments];

            const activityItem: ActivityFeedItem = {
              id: `act-${Date.now()}`,
              message: `Closed Deal! Booked Property ${matchingProperty.propertyNo} for ${query.name} (Amount: ₹${propertyValue.toLocaleString()})`,
              type: 'booking',
              priority: 'high',
              read: false,
              timestamp: new Date().toISOString()
            };
            updatedActivityFeed = [activityItem, ...state.activityFeed];
          }
        }

        return {
          queries: state.queries.map(q => q.id === id ? { ...q, status, isContacted: status !== 'New' } : q),
          followUps: updatedFollowUps,
          siteVisits: updatedSiteVisits,
          properties: updatedProperties,
          payments: updatedPayments,
          activityFeed: updatedActivityFeed
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
          const brokerName = visit.source.startsWith('Broker: ') ? visit.source.replace('Broker: ', '') : null;
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
          siteVisits: [{ ...visit, id: newVisitId }, ...state.siteVisits],
          followUps: newFollowUp ? [newFollowUp, ...state.followUps] : state.followUps,
          brokers: updatedBrokers
        };
      }),

      updateSiteVisitStatus: (id, status) => set((state) => ({
        siteVisits: state.siteVisits.map(v => v.id === id ? { ...v, status } : v)
      })),
      deleteSiteVisit: (id) => set((state) => ({
        siteVisits: state.siteVisits.filter(v => v.id !== id)
      })),
      updateSiteVisit: (id, visitData) => set((state) => ({
        siteVisits: state.siteVisits.map(v => v.id === id ? { ...v, ...visitData } : v)
      })),

      addFollowUp: (f) => set((state) => {
        const now = new Date();
        const realTimeCreatedAt = now.toISOString();
        return {
          followUps: [{ ...f, id: `f${Date.now()}`, interactions: [], createdAt: realTimeCreatedAt }, ...state.followUps],
          unreadFollowUps: state.activeModule === 'followup' ? 0 : state.unreadFollowUps + 1
        };
      }),

      addFollowUpInteraction: (id, interaction) => set((state) => {
        const followUp = state.followUps.find(f => f.id === id);
        const now = new Date();
        const timestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

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

        let updatedPayments = state.payments;
        let updatedProperties = state.properties;

        if (status === 'Booked') {
          const hasExistingPayment = state.payments.some(
            p => p.customerName === followUp.customerName && p.bookingStatus === 'Active'
          );
          if (!hasExistingPayment) {
            const linkedProperty = state.properties.find(p =>
              p.customerName && p.customerName.toLowerCase() === followUp.customerName.toLowerCase()
            );
            const newPayment: Payment = {
              id: `p${Date.now()}`,
              customerName: followUp.customerName,
              plotId: linkedProperty?.propertyNo || 'TBD',
              date: timestamp,
              amount: 0,
              mode: 'Bank Transfer',
              installmentRatio: 'Booking Amount',
              installmentName: 'Booking Amount',
              balanceDue: linkedProperty ? (linkedProperty.area || 0) * (linkedProperty.rate || 0) : 0,
              status: 'Pending',
              receiptNumber: `BK-${Date.now().toString().slice(-4)}`,
              bookingStatus: 'Active'
            };
            updatedPayments = [newPayment, ...state.payments];
          }

          updatedProperties = state.properties.map(p => {
            if (p.customerName &&
              p.customerName.toLowerCase() === followUp.customerName.toLowerCase() &&
              p.status !== 'Booked' && p.status !== 'Sold') {
              return {
                ...p,
                status: 'Booked' as PropertyStatus,
                bookingDate: timestamp
              };
            }
            return p;
          });
        }

        if (status === 'Lost') {
          updatedPayments = state.payments.map(p => {
            if (p.customerName.toLowerCase() === followUp.customerName.toLowerCase() && p.status === 'Pending' && p.bookingStatus === 'Active') {
              return { ...p, bookingStatus: 'Cancelled' as const };
            }
            return p;
          });

          updatedProperties = state.properties.map(p => {
            if (p.customerName &&
              p.customerName.toLowerCase() === followUp.customerName.toLowerCase() &&
              p.status === 'Booked') {
              return {
                ...p,
                status: 'Available' as PropertyStatus,
                customerName: undefined,
                bookingDate: undefined
              };
            }
            return p;
          });
        }

        return {
          followUps: state.followUps.map(f => f.id === id ? { ...f, status } : f),
          payments: updatedPayments,
          properties: updatedProperties,
        };
      }),

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

      sendWeekendPostToCsvContacts: (postTitle: string, contacts: any[]) => set((state) => {
        const customersGroupEnabled = state.weekendRules.find(r => r.id === 'r4')?.enabled ?? true;

        const lostCustomerNames = new Set(
          state.followUps.filter(f => f.status === 'Lost').map(f => f.customerName.toLowerCase())
        );
        const filteredContacts = contacts.filter((c: any) =>
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

        let updatedFollowUps = state.followUps;
        if (customersGroupEnabled) {
          updatedFollowUps = state.followUps.map(f => {
            if (f.status === 'Lost') return f;

            const isContact = filteredContacts.some((c: any) =>
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

      addProperty: (property) => set((state) => {
        const timestamp = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const feedItem: ActivityFeedItem = {
          id: `af${Date.now()}-property`,
          message: `Property ${property.propertyNo} added in ${property.projectName}`,
          type: 'system',
          priority: 'low',
          read: false,
          timestamp
        };

        return {
          properties: [{ ...property, id: `pr${Date.now()}` }, ...state.properties],
          activityFeed: [feedItem, ...state.activityFeed]
        };
      }),

      addProperties: (newProps) => set((state) => {
        const timestamp = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const created = newProps.map((property, i) => ({ ...property, id: `pr${Date.now()}-${i}` }));
        const feedItem: ActivityFeedItem = {
          id: `af${Date.now()}-bulk`,
          message: `${created.length} ${newProps[0]?.type || 'property'} units added to ${newProps[0]?.projectName}`,
          type: 'system',
          priority: 'low',
          read: false,
          timestamp
        };
        return {
          properties: [...created, ...state.properties],
          activityFeed: [feedItem, ...state.activityFeed]
        };
      }),

      updatePropertyStatus: (id, status, customerName) => set((state) => {
        const property = state.properties.find(p => p.id === id);
        if (!property) return state;

        const timestamp = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const bookingDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const feedItem: ActivityFeedItem = {
          id: `af${Date.now()}-property-status`,
          message: `Property ${property.propertyNo} changed to ${status}`,
          type: status === 'Booked' || status === 'Sold' ? 'booking' : 'system',
          priority: status === 'Sold' ? 'high' : 'medium',
          read: false,
          timestamp
        };

        const resolvedCustomer = (status === 'Available' || status === 'Hold') ? undefined : (customerName || property.customerName);
        const resolvedBookingDate = (status === 'Available' || status === 'Hold') ? undefined : (status === 'Booked' || status === 'Sold' ? bookingDate : property.bookingDate);

        // Synchronize with Property Holders
        let updatedHolders = state.propertyHolders;
        const exists = state.propertyHolders.some(h => h.parcelId === property.propertyNo);
        if ((status === 'Booked' || status === 'Sold') && !exists) {
          const propertyValue = property.area * property.rate;
          const newHolder: PropertyHolder = {
            id: `ph-${Date.now()}`,
            name: resolvedCustomer || 'TBD',
            parcelId: property.propertyNo,
            totalAmount: propertyValue,
            paidAmount: 0,
            installments: [
              {
                id: `inst-${Date.now()}`,
                installmentName: 'Booking Amount',
                dueDate: resolvedBookingDate || bookingDate,
                amount: Math.round(propertyValue * 0.1), // 10% booking amount as default step
                condition: 'On Booking',
                status: 'Upcoming'
              }
            ],
            payments: []
          };
          updatedHolders = [newHolder, ...state.propertyHolders];
        } else if (status === 'Available' || status === 'Hold') {
          // If canceled, remove the associated property holder
          updatedHolders = state.propertyHolders.filter(h => h.parcelId !== property.propertyNo);
        } else if (resolvedCustomer) {
          // If status is still Booked/Sold, sync customer name change
          updatedHolders = state.propertyHolders.map(h => {
            if (h.parcelId === property.propertyNo) {
              return { ...h, name: resolvedCustomer };
            }
            return h;
          });
        }

        return {
          properties: state.properties.map(p => p.id === id ? {
            ...p,
            status,
            customerName: resolvedCustomer,
            bookingDate: resolvedBookingDate
          } : p),
          propertyHolders: updatedHolders,
          activityFeed: [feedItem, ...state.activityFeed]
        };
      }),

      updateProperty: (id, propertyData) => set((state) => {
        const property = state.properties.find(p => p.id === id);
        if (!property) return state;

        const updatedProperty = { ...property, ...propertyData };
        const updatedValue = updatedProperty.area * updatedProperty.rate;

        const updatedHolders = state.propertyHolders.map(h => {
          if (h.parcelId === property.propertyNo) {
            return {
              ...h,
              name: updatedProperty.customerName || h.name,
              parcelId: updatedProperty.propertyNo,
              totalAmount: updatedValue
            };
          }
          return h;
        });

        return {
          properties: state.properties.map(p => p.id === id ? updatedProperty : p),
          propertyHolders: updatedHolders
        };
      }),

      addLabourAgency: (agency) => set((state) => {
        const timestamp = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const feedItem: ActivityFeedItem = {
          id: `af${Date.now()}-labour`,
          message: `${agency.agencyName} added for ${agency.assignedSite}`,
          type: 'system',
          priority: 'low',
          read: false,
          timestamp
        };

        return {
          labourAgencies: [{ ...agency, id: `la${Date.now()}` }, ...state.labourAgencies],
          activityFeed: [feedItem, ...state.activityFeed]
        };
      }),

      updateLabourStatus: (id, status) => set((state) => {
        const agency = state.labourAgencies.find(item => item.id === id);
        if (!agency) return state;

        const timestamp = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const feedItem: ActivityFeedItem = {
          id: `af${Date.now()}-labour-status`,
          message: `${agency.agencyName} marked ${status}`,
          type: 'system',
          priority: status === 'On Hold' ? 'medium' : 'low',
          read: false,
          timestamp
        };

        return {
          labourAgencies: state.labourAgencies.map(item => item.id === id ? { ...item, status } : item),
          activityFeed: [feedItem, ...state.activityFeed]
        };
      }),

      addMaterialTxn: (txn) => set((state) => {
        const now = new Date();
        const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const newTxn = { ...txn, id: `mt${Date.now()}`, date: txn.date || timestamp };

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

        return {
          materialTxns: [newTxn, ...state.materialTxns],
          materialStock: updatedStock,
          notifications: updatedStock.some(m => m.current < m.threshold) ? state.notifications + 1 : state.notifications,
          activityFeed: [...newFeedItems, ...state.activityFeed]
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
            statusText: newQty < threshold ? '⚠ Very Low Stock' : (newQty < threshold * 1.5 ? '⚠ Order Soon' : '')
          };
        })
      })),

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

      addPayment: (payment) => set((state) => {
        const now = new Date();
        const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const pId = payment.plotId;

        const feedItem: ActivityFeedItem = {
          id: `af${Date.now()}-pay`,
          message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} received from ${payment.customerName} (${payment.mode === 'Cash' ? 'Cash' : 'White'})`,
          type: 'payment',
          priority: 'medium',
          read: false,
          timestamp: fullTimestamp
        };

        let updatedProperties = state.properties;
        let propertyStatusChange: { propertyId: string, newStatus: string } | null = null;
        const property = state.properties.find(p => p.propertyNo === pId);
        if (property) {
          const isFullPayment = payment.installmentName === 'Full Sale' || payment.installmentRatio === 'Full Sale';
          if (isFullPayment && property.status === 'Booked') {
            updatedProperties = state.properties.map(p => {
              if (p.propertyNo === pId) {
                propertyStatusChange = { propertyId: p.id, newStatus: 'Sold' };
                return { ...p, status: 'Sold' as PropertyStatus, bookingDate: p.bookingDate || timestamp };
              }
              return p;
            });
          }
        }

        let additionalFeedItems: ActivityFeedItem[] = [];
        let updatedBrokers = state.brokers;

        if (propertyStatusChange) {
          const propertyValue = (property?.area || 0) * (property?.rate || 0);
          additionalFeedItems.push({
            id: `af${Date.now()}-sold`,
            message: `Property ${property?.propertyNo} updated to Sold — payment received from ${payment.customerName}`,
            type: 'booking',
            priority: 'high',
            read: false,
            timestamp: fullTimestamp
          });

          const relatedFollowUp = state.followUps.find(f =>
            f.customerName.toLowerCase() === payment.customerName.toLowerCase() &&
            ((f as any).source === 'Broker' || (f as any).source?.startsWith?.('Broker:')) &&
            (f as any).brokerName
          );
          if (relatedFollowUp && (relatedFollowUp as any).brokerName) {
            const broker = state.brokers.find(b => b.name === (relatedFollowUp as any).brokerName);

            if (broker) {
              const commission = payment.amount * 0.02;
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

        const updatedFollowUps = state.followUps.map(f => {
          if (f.customerName.toLowerCase() === payment.customerName.toLowerCase() ||
            (pId && f.interest.toLowerCase() === pId.toLowerCase())) {
            const interaction: Interaction = {
              id: `i${Date.now()}`,
              type: 'Receipt' as InteractionType,
              outcome: 'N/A' as InteractionOutcome,
              notes: `Receipt: ₹${payment.amount.toLocaleString('en-IN')} Settled. Installment ${payment.installmentName || payment.installmentRatio || 'Registry'} recorded via ${payment.mode}`,
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
          properties: updatedProperties,
          brokers: updatedBrokers,
          activityFeed: [feedItem, ...additionalFeedItems, ...state.activityFeed],
          followUps: updatedFollowUps
        };
      }),

      markInstallmentPaid: (holderId, installmentId, paidDate) => set((state) => {
        const holder = state.propertyHolders.find(h => h.id === holderId);
        const installment = holder?.installments.find(i => i.id === installmentId);
        const amount = installment?.amount || 0;
        const now = new Date();
        const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

        let newFeedItems: ActivityFeedItem[] = [];
        if (holder && installment) {
          newFeedItems.push({
            id: `af${Date.now()}-land`,
            message: `₹${amount.toLocaleString('en-IN')} paid to ${holder.name} for ${holder.parcelId} (${installment.installmentName})`,
            type: 'payment',
            priority: 'medium',
            read: false,
            timestamp: fullTimestamp
          });
        }

        const newPayment: PropertyHolderPayment = {
          id: `phyp-inst-${Date.now()}`,
          date: paidDate,
          amount: amount,
          mode: 'White',
          balance: (holder ? holder.totalAmount - holder.paidAmount - amount : 0)
        };

        return {
          propertyHolders: state.propertyHolders.map(h =>
            h.id === holderId ? {
              ...h,
              paidAmount: h.paidAmount + amount,
              installments: h.installments.map(i => i.id === installmentId ? { ...i, status: 'Paid' as const, paidDate: paidDate } : i),
              payments: [newPayment, ...(h.payments || [])]
            } : h
          ),
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

        const newFeedItem: ActivityFeedItem = {
          id: `af${Date.now()}-sched`,
          message: `New installment: ${installment.installmentName} ₹${installment.amount.toLocaleString('en-IN')} to ${holder?.name || 'owner'} for ${holder?.parcelId || 'land'} due ${installment.dueDate}`,
          type: 'system',
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

      addPropertyHolderPayment: (holderId, payment) => set((state) => {
        const now = new Date();
        const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const holder = state.propertyHolders.find(h => h.id === holderId);

        const newPayment: PropertyHolderPayment = {
          ...payment,
          id: `phyp-${Date.now()}`
        };

        const newFeedItem: ActivityFeedItem = {
          id: `af${Date.now()}-phpay`,
          message: `₹${payment.amount.toLocaleString('en-IN')} paid to ${holder?.name || 'owner'} for ${holder?.parcelId || ''}`,
          type: 'payment',
          priority: 'medium',
          read: false,
          timestamp: fullTimestamp
        };

        return {
          propertyHolders: state.propertyHolders.map(ph => {
            if (ph.id === holderId) {
              return {
                ...ph,
                paidAmount: ph.paidAmount + payment.amount,
                payments: [newPayment, ...(ph.payments || [])]
              };
            }
            return ph;
          }),
          activityFeed: [newFeedItem, ...state.activityFeed]
        };
      }),

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

      addSalaryAdvance: (advance) => set((state) => {
        const now = new Date();
        const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
        const newAdvance: SalaryAdvance = { ...advance, id: `sa${Date.now()}`, deducted: false };

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

        const matchedSalary = state.salaries.find(s =>
          s.employeeName.toLowerCase() === advance.employeeName.toLowerCase() && s.month === nextMonth
        );
        const finalAdvance = matchedSalary ? { ...newAdvance, deducted: true } : newAdvance;

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

      addCampaign: (campaign) => set((state) => ({
        campaigns: [{ ...campaign, id: `c${Date.now()}` }, ...state.campaigns]
      })),

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

      sendWeekendPostNow: (postTitle: string, contactCount: number, contactIdentifiers?: string[]) => set((state) => {
        const now = new Date();
        const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const fullTimestamp = now.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

        const logEntry: TransmissionLog = {
          id: `tl${Date.now()}`,
          postTitle,
          delivered: contactCount,
          read: 0,
          channel: 'WhatsApp',
          date: timestamp
        };

        const feedItem: ActivityFeedItem = {
          id: `af${Date.now()}`,
          message: `Weekend post sent to ${contactCount} contacts`,
          type: 'weekend_post',
          priority: 'low',
          read: false,
          timestamp: fullTimestamp
        };

        let updatedFollowUps = state.followUps;
        if (contactIdentifiers && contactIdentifiers.length > 0) {
          updatedFollowUps = state.followUps.map(f => {
            if (f.status === 'Lost') return f;
            const isContact = contactIdentifiers.some((c: any) =>
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
          transmissionLogs: [logEntry, ...state.transmissionLogs],
          activityFeed: [feedItem, ...state.activityFeed],
          followUps: updatedFollowUps
        };
      }),

      addUploadedCsv: (csv) => set((state) => {
        const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const fullTimestamp = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

        const newCsv: UploadedCsv = {
          ...csv,
          id: `csv-${Date.now()}`,
          date: timestamp
        };

        const feedItem: ActivityFeedItem = {
          id: `af${Date.now()}`,
          message: `CSV file uploaded: ${csv.name} (${csv.data.length} records)`,
          type: 'system',
          priority: 'low',
          read: false,
          timestamp: fullTimestamp
        };

        return {
          uploadedCsvs: [newCsv, ...state.uploadedCsvs],
          activityFeed: [feedItem, ...state.activityFeed]
        };
      }),
      deleteUploadedCsv: (id) => set((state) => ({
        uploadedCsvs: state.uploadedCsvs.filter(csv => csv.id !== id)
      })),
      resetSystem: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ownthume-storage');
          window.location.reload();
        }
      },
    }),
    {
      name: 'ownthume-storage',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('ownthume-storage');
          }
          return {
            activeModule: 'dashboard',
            isPinUnlocked: false,
            systemPin: '1234',
            globalModal: null,
            unreadFollowUps: 0,
            notifications: 0,
            unreadQueries: 0,
            queries: [],
            siteVisits: [],
            followUps: [],
            brokers: [],
            weekendPosts: [],
            transmissionLogs: [],
            weekendRules: [],
            uploadedCsvs: [],
            properties: [],
            labourAgencies: [],
            materialStock: [],
            materialTxns: [],
            assets: [],
            payments: [],
            propertyHolders: [],
            salaries: [],
            salaryAdvances: [],
            campaigns: [],
            activityFeed: []
          } as any;
        }
        return persistedState;
      }
    }
  )
);
