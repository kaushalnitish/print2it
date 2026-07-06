import { supabase, isSupabaseConfigured } from './supabase';
import { Shop } from '../context/SaaSContext';
import { PrintJob } from '../types';

// Helper to format timestamps dynamically from ISO database dates
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
}

// ---------------------------------------------------------------------
// TYPE MAPPERS (Database Row <=> Frontend UI state)
// ---------------------------------------------------------------------
export function mapDbJobToJob(dbJob: any): PrintJob {
  return {
    id: dbJob.job_id,
    token: dbJob.token,
    fileName: dbJob.file_name,
    fileSize: dbJob.file_size,
    pages: dbJob.pages,
    copies: dbJob.copies,
    colorMode: dbJob.color_mode as 'bw' | 'color',
    paperSize: dbJob.paper_size as 'a4' | 'a3',
    sideMode: dbJob.side_mode as 'single' | 'double',
    status: dbJob.status as any,
    timestamp: dbJob.created_at ? formatTimestamp(dbJob.created_at) : 'Just now'
  };
}

export function mapDbShopToShop(dbShop: any, dbJobs: any[] = []): Shop {
  const printJobs = (dbJobs || []).map(mapDbJobToJob);
  const portalUrl = dbShop.customer_portal_url || `${window.location.origin}${window.location.pathname === '/' ? '' : window.location.pathname}#/s/${dbShop.shop_slug}`;
  
  return {
    id: dbShop.id, // Internal database UUID
    shopId: dbShop.shop_id, // Front-facing string ID e.g., 'SH-1234'
    slug: dbShop.shop_slug,
    shopSlug: dbShop.shop_slug,
    name: dbShop.shop_name,
    shopName: dbShop.shop_name,
    ownerName: dbShop.profiles?.name || 'Valued Owner',
    email: dbShop.profiles?.email || '',
    phone: dbShop.phone,
    address: dbShop.address,
    subscription: dbShop.subscription as any,
    customerPortalUrl: portalUrl,
    pairingKey: dbShop.pairing_key,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portalUrl)}`,
    printerStatus: dbShop.printer_status as any,
    agentStatus: dbShop.agent_status as any,
    createdDate: dbShop.created_at ? new Date(dbShop.created_at).toISOString().split('T')[0] : '',
    printJobs: printJobs,
    get jobs() {
      return this.printJobs;
    }
  };
}

// ---------------------------------------------------------------------
// AUTHENTICATION FOUNDATION SERVICES
// ---------------------------------------------------------------------
export const supabaseAuth = {
  async signUp(email: string, password: string, name: string, phone: string) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
    }
    
    // Sign up using Supabase authentication, passing custom metadata for profile creation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured yet.');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    
    // Fetch user public profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return {
      uid: user.id,
      email: user.email || '',
      name: profile?.name || 'Valued Owner',
      phone: profile?.phone || ''
    };
  }
};

// ---------------------------------------------------------------------
// DATABASE CRUD SERVICES (Shops & Print Jobs)
// ---------------------------------------------------------------------
export const supabaseDb = {
  // Fetch all shops with their associated profiles and print jobs
  async fetchShops(): Promise<Shop[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    
    try {
      // 1. Fetch shops with profile details
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
        
      if (shopsError) throw shopsError;
      if (!shopsData) return [];
      
      // 2. Fetch print jobs for all returned shops
      const shopUuids = shopsData.map(s => s.id);
      const { data: jobsData, error: jobsError } = await supabase
        .from('print_jobs')
        .select('*')
        .in('shop_id', shopUuids)
        .order('created_at', { ascending: false });
        
      if (jobsError) throw jobsError;
      
      // Map database rows into frontend-ready structures
      return shopsData.map(shopRow => {
        const matchingJobs = (jobsData || []).filter(jobRow => jobRow.shop_id === shopRow.id);
        return mapDbShopToShop(shopRow, matchingJobs);
      });
    } catch (err) {
      console.error('Supabase error fetching shops:', err);
      throw err;
    }
  },

  // Create a new shop branch
  async createShop(shop: Omit<Shop, 'printJobs' | 'jobs' | 'createdDate'>, ownerId: string): Promise<Shop> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    
    const dbPayload = {
      shop_id: shop.shopId,
      shop_slug: shop.shopSlug,
      shop_name: shop.shopName,
      owner_id: ownerId,
      phone: shop.phone,
      address: shop.address,
      subscription: shop.subscription,
      pairing_key: shop.pairingKey,
      printer_status: shop.printerStatus,
      agent_status: shop.agentStatus
    };
    
    const { data: insertedShop, error } = await supabase
      .from('shops')
      .insert(dbPayload)
      .select(`
        *,
        profiles (
          name,
          email
        )
      `)
      .single();
      
    if (error) throw error;
    return mapDbShopToShop(insertedShop, []);
  },

  // Update shop metadata/settings
  async updateShop(shopUuid: string, updates: Partial<Shop>): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    const dbPayload: any = {};
    if (updates.shopName !== undefined) dbPayload.shop_name = updates.shopName;
    if (updates.shopSlug !== undefined) dbPayload.shop_slug = updates.shopSlug;
    if (updates.phone !== undefined) dbPayload.phone = updates.phone;
    if (updates.address !== undefined) dbPayload.address = updates.address;
    if (updates.subscription !== undefined) dbPayload.subscription = updates.subscription;
    if (updates.printerStatus !== undefined) dbPayload.printer_status = updates.printerStatus;
    if (updates.agentStatus !== undefined) dbPayload.agent_status = updates.agentStatus;
    
    if (Object.keys(dbPayload).length === 0) return;
    
    const { error } = await supabase
      .from('shops')
      .update(dbPayload)
      .eq('id', shopUuid);
      
    if (error) throw error;
  },

  // Delete a shop branch
  async deleteShop(shopUuid: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopUuid);
      
    if (error) throw error;
  },

  // Add a new walk-in customer print job
  async createPrintJob(shopUuid: string, job: Omit<PrintJob, 'id' | 'timestamp'> & { id?: string }): Promise<PrintJob> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured.');
    }
    
    const generatedJobId = job.id || `job-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const dbPayload = {
      job_id: generatedJobId,
      token: job.token,
      file_name: job.fileName,
      file_size: job.fileSize,
      pages: job.pages,
      copies: job.copies,
      color_mode: job.colorMode,
      paper_size: job.paperSize,
      side_mode: job.sideMode,
      status: job.status || 'submitted',
      shop_id: shopUuid
    };
    
    const { data: insertedJob, error } = await supabase
      .from('print_jobs')
      .insert(dbPayload)
      .select('*')
      .single();
      
    if (error) throw error;
    return mapDbJobToJob(insertedJob);
  },

  // Update a print job status
  async updatePrintJobStatus(jobId: string, status: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    const { error } = await supabase
      .from('print_jobs')
      .update({ status })
      .eq('job_id', jobId);
      
    if (error) throw error;
  },

  // Clear all jobs for a shop branch
  async clearShopJobs(shopUuid: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    
    const { error } = await supabase
      .from('print_jobs')
      .delete()
      .eq('shop_id', shopUuid);
      
    if (error) throw error;
  }
};
