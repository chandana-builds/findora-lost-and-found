import {
  ItemReport,
  ItemMatch,
  ClaimRequest,
  InAppNotification,
  ActivityLog,
  UserProfile,
  PlatformStats,
  ReportType,
  Category,
  OrganizationType,
  ItemStatus,
  ClaimStatus,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_ITEMS, INITIAL_USERS } from './mockSeedData';
import { findMatchesForItem } from '../utils/matchingEngine';

const STORAGE_KEYS = {
  USERS: 'findora_db_users',
  ITEMS: 'findora_db_items',
  MATCHES: 'findora_db_matches',
  CLAIMS: 'findora_db_claims',
  NOTIFICATIONS: 'findora_db_notifications',
  LOGS: 'findora_db_logs',
  SESSION: 'findora_auth_session',
};

// Initial state setup for persistent storage
function initLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    // Generate initial matches between seed items
    const matches: ItemMatch[] = [];
    const items = INITIAL_ITEMS;
    items.forEach((item) => {
      if (item.report_type === 'lost') {
        const foundMatches = findMatchesForItem(item, items);
        matches.push(...foundMatches);
      }
    });
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    const initialClaims: ClaimRequest[] = [
      {
        id: 'claim_sample_1',
        item_id: 'item_found_201',
        claimant_id: 'user_alex_1',
        claimant_name: 'Alex Rivera',
        claimant_email: 'alex.rivera@campus.edu',
        message: 'This matches the MacBook Pro I misplaced in study room 204. It has my coursework decals on the bottom.',
        private_verification_details: 'Serial number ends in 77XG. Desktop wallpaper is a solar eclipse photo.',
        status: 'under_review',
        created_at: '2026-10-18T19:00:00Z',
        updated_at: '2026-10-18T19:00:00Z',
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(initialClaims));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    const initialNotifs: InAppNotification[] = [
      {
        id: 'notif_init_1',
        recipient_id: 'user_alex_1',
        event_type: 'match_found',
        related_item_id: 'item_lost_101',
        title: 'Potential Match Found!',
        message: 'A found report "Apple Laptop in Dark Sleeve" matches your lost MacBook Pro (Score: 88%).',
        is_read: false,
        created_at: '2026-10-18T17:50:00Z',
      },
      {
        id: 'notif_init_2',
        recipient_id: 'user_sarah_2',
        event_type: 'claim_submitted',
        related_item_id: 'item_found_201',
        related_claim_id: 'claim_sample_1',
        title: 'New Ownership Claim Submitted',
        message: 'Alex Rivera submitted an ownership verification claim for Apple Laptop in Dark Sleeve.',
        is_read: false,
        created_at: '2026-10-18T19:02:00Z',
      }
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    const initialLogs: ActivityLog[] = [
      {
        id: 'log_init_1',
        actor_id: 'user_admin_1',
        actor_name: 'Findora Administrator',
        action: 'SYSTEM_INITIALIZED',
        entity_type: 'item',
        entity_id: 'system',
        created_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
  }
}

initLocalStorage();

// Helper helpers
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

export const db = {
  // -------------------------------------------------------------
  // AUTHENTICATION & USERS
  // -------------------------------------------------------------
  async getCurrentSessionUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) return profile;
          return {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 'User',
            role: (session.user.user_metadata?.role as any) || 'user',
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Supabase auth session fetch error, checking local session', err);
      }
    }

    const session = getStored<UserProfile | null>(STORAGE_KEYS.SESSION, null);
    return session;
  },

  async signUp(email: string, password: string, fullName: string, role: 'user' | 'admin' = 'user'): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            email,
            full_name: fullName,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await supabase.from('profiles').upsert(newProfile);
          return newProfile;
        }
      } catch (err) {
        console.warn('Supabase signUp error, handling in persistent storage:', err);
      }
    }

    const users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.SESSION, newUser);

    await this.logActivity(newUser.id, newUser.full_name, 'USER_REGISTERED', 'user', newUser.id);
    return newUser;
  },

  async signIn(email: string, _password: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _password,
        });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) return profile;
          return {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || 'Findora Member',
            role: (data.user.user_metadata?.role as any) || 'user',
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Supabase signIn error, checking local store:', err);
      }
    }

    const users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials or register an account.');
    }

    setStored(STORAGE_KEYS.SESSION, user);
    await this.logActivity(user.id, user.full_name, 'USER_SIGN_IN', 'user', user.id);
    return user;
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error', err);
      }
    }
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      return;
    }

    const users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('No account found with this email address.');
    }
    // Simulated successful recovery email
    return;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('Supabase profile update error, falling back to local storage', err);
      }
    }

    const users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('User not found');

    const updatedUser = {
      ...users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    users[index] = updatedUser;
    setStored(STORAGE_KEYS.USERS, users);

    // Update active session if it matches
    const session = getStored<UserProfile | null>(STORAGE_KEYS.SESSION, null);
    if (session && session.id === userId) {
      setStored(STORAGE_KEYS.SESSION, updatedUser);
    }

    return updatedUser;
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAllUsers error', err);
      }
    }
    return getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
  },

  // -------------------------------------------------------------
  // ITEMS (LOST & FOUND)
  // -------------------------------------------------------------
  async getItems(filters: {
    search?: string;
    reportType?: 'all' | ReportType;
    category?: string;
    organizationType?: string;
    status?: string;
    sortBy?: 'newest' | 'oldest' | 'relevance';
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: ItemReport[]; totalCount: number }> {
    const {
      search = '',
      reportType = 'all',
      category = '',
      organizationType = '',
      status = 'all',
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = filters;

    // Load from persistent local database or Supabase
    let allItems: ItemReport[] = [];
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('items').select('*', { count: 'exact' });
        if (reportType !== 'all') query = query.eq('report_type', reportType);
        if (category && category !== 'All Categories') query = query.eq('category', category);
        if (organizationType && organizationType !== 'All Locations') query = query.eq('organization_type', organizationType);
        if (status && status !== 'all') query = query.eq('status', status);
        if (search) query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);

        if (sortBy === 'newest') query = query.order('created_at', { ascending: false });
        else if (sortBy === 'oldest') query = query.order('created_at', { ascending: true });

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        const { data, count, error } = await query.range(from, to);

        if (!error && data) {
          return { items: data, totalCount: count || data.length };
        }
      } catch (err) {
        console.warn('Supabase getItems error, using local persistent store', err);
      }
    }

    allItems = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);

    // Filter in-memory
    let filtered = allItems.filter((item) => {
      if (reportType !== 'all' && item.report_type !== reportType) return false;
      if (category && category !== 'All Categories' && item.category !== category) return false;
      if (organizationType && organizationType !== 'All Locations' && item.organization_type !== organizationType) return false;
      if (status !== 'all' && item.status !== status) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = item.item_name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesBrand = (item.brand || '').toLowerCase().includes(q);
        const matchesColor = (item.color || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesLoc && !matchesBrand && !matchesColor) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const totalCount = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return { items: paginated, totalCount };
  },

  async getItemById(id: string): Promise<ItemReport | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getItemById error', err);
      }
    }

    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    return items.find((i) => i.id === id) || null;
  },

  async createItem(itemData: Omit<ItemReport, 'id' | 'created_at' | 'updated_at'>): Promise<ItemReport> {
    const newItem: ItemReport = {
      ...itemData,
      id: `item_${itemData.report_type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('items').insert(newItem).select().single();
        if (!error && data) {
          // Trigger matching engine
          await this.triggerMatching(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase createItem error, falling back to local store', err);
      }
    }

    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    items.unshift(newItem);
    setStored(STORAGE_KEYS.ITEMS, items);

    // Run matching engine and notifications
    await this.triggerMatching(newItem);
    await this.logActivity(newItem.user_id, newItem.user_name || 'User', 'ITEM_CREATED', 'item', newItem.id, {
      type: newItem.report_type,
      title: newItem.item_name,
    });

    return newItem;
  },

  async updateItem(id: string, updates: Partial<ItemReport>, actorId?: string): Promise<ItemReport> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('items')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          await this.triggerMatching(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase updateItem error', err);
      }
    }

    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Item not found');

    const updated = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    items[index] = updated;
    setStored(STORAGE_KEYS.ITEMS, items);

    await this.triggerMatching(updated);
    if (actorId) {
      await this.logActivity(actorId, updated.user_name || 'User', 'ITEM_UPDATED', 'item', updated.id);
    }
    return updated;
  },

  async deleteItem(id: string, actorId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteItem error', err);
      }
    }

    let items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    items = items.filter((i) => i.id !== id);
    setStored(STORAGE_KEYS.ITEMS, items);

    // Clean up matches for deleted item
    let matches = getStored<ItemMatch[]>(STORAGE_KEYS.MATCHES, []);
    matches = matches.filter((m) => m.lost_item_id !== id && m.found_item_id !== id);
    setStored(STORAGE_KEYS.MATCHES, matches);

    if (actorId) {
      await this.logActivity(actorId, 'User', 'ITEM_DELETED', 'item', id);
    }
  },

  async getUserItems(userId: string): Promise<ItemReport[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getUserItems error', err);
      }
    }

    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    return items.filter((i) => i.user_id === userId);
  },

  // -------------------------------------------------------------
  // SMART MATCHING ENGINE & NOTIFICATIONS
  // -------------------------------------------------------------
  async triggerMatching(targetItem: ItemReport): Promise<ItemMatch[]> {
    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    const matches = getStored<ItemMatch[]>(STORAGE_KEYS.MATCHES, []);

    const newMatches = findMatchesForItem(targetItem, items);

    for (const match of newMatches) {
      // Check if match already exists
      const existingIndex = matches.findIndex(
        (m) =>
          (m.lost_item_id === match.lost_item_id && m.found_item_id === match.found_item_id) ||
          (m.lost_item_id === match.found_item_id && m.found_item_id === match.lost_item_id)
      );

      if (existingIndex >= 0) {
        matches[existingIndex] = {
          ...matches[existingIndex],
          match_score: match.match_score,
          match_reasons: match.match_reasons,
          updated_at: new Date().toISOString(),
        };
      } else {
        matches.push(match);

        // Notify both parties of potential match!
        const lostReport = items.find((i) => i.id === match.lost_item_id);
        const foundReport = items.find((i) => i.id === match.found_item_id);

        if (lostReport && targetItem.id === foundReport?.id) {
          await this.createNotification({
            recipient_id: lostReport.user_id,
            event_type: 'match_found',
            related_item_id: lostReport.id,
            title: 'Potential Match Discovered!',
            message: `A newly reported found item "${foundReport.item_name}" closely matches your lost item "${lostReport.item_name}" (${match.match_score}% similarity).`,
          });
        } else if (foundReport && targetItem.id === lostReport?.id) {
          await this.createNotification({
            recipient_id: foundReport.user_id,
            event_type: 'match_found',
            related_item_id: foundReport.id,
            title: 'Potential Owner Match Found!',
            message: `A lost item report "${lostReport.item_name}" matches the item you found "${foundReport.item_name}" (${match.match_score}% similarity).`,
          });
        }
      }
    }

    setStored(STORAGE_KEYS.MATCHES, matches);
    return newMatches;
  },

  async getMatchesForItem(itemId: string): Promise<ItemMatch[]> {
    const matches = getStored<ItemMatch[]>(STORAGE_KEYS.MATCHES, []);
    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);

    const relevant = matches.filter(
      (m) => m.lost_item_id === itemId || m.found_item_id === itemId
    );

    // Hydrate lost and found item details
    return relevant.map((m) => ({
      ...m,
      lost_item: items.find((i) => i.id === m.lost_item_id),
      found_item: items.find((i) => i.id === m.found_item_id),
    })).sort((a, b) => b.match_score - a.match_score);
  },

  async getUserMatches(userId: string): Promise<ItemMatch[]> {
    const userItems = await this.getUserItems(userId);
    const userItemIds = new Set(userItems.map((i) => i.id));
    const allMatches = getStored<ItemMatch[]>(STORAGE_KEYS.MATCHES, []);
    const allItems = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);

    const relevant = allMatches.filter(
      (m) => userItemIds.has(m.lost_item_id) || userItemIds.has(m.found_item_id)
    );

    return relevant.map((m) => ({
      ...m,
      lost_item: allItems.find((i) => i.id === m.lost_item_id),
      found_item: allItems.find((i) => i.id === m.found_item_id),
    })).sort((a, b) => b.match_score - a.match_score);
  },

  async getAllMatches(): Promise<ItemMatch[]> {
    const matches = getStored<ItemMatch[]>(STORAGE_KEYS.MATCHES, []);
    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);

    return matches.map((m) => ({
      ...m,
      lost_item: items.find((i) => i.id === m.lost_item_id),
      found_item: items.find((i) => i.id === m.found_item_id),
    })).sort((a, b) => b.match_score - a.match_score);
  },

  // -------------------------------------------------------------
  // CLAIMS & REUNIFICATION WORKFLOW
  // -------------------------------------------------------------
  async submitClaim(claimData: {
    item_id: string;
    claimant_id: string;
    claimant_name: string;
    claimant_email: string;
    message: string;
    private_verification_details: string;
  }): Promise<ClaimRequest> {
    const claims = getStored<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);

    // Prevent duplicate active claims
    const existing = claims.find(
      (c) =>
        c.item_id === claimData.item_id &&
        c.claimant_id === claimData.claimant_id &&
        ['pending', 'under_review'].includes(c.status)
    );
    if (existing) {
      throw new Error('You already have an active pending claim for this item.');
    }

    const newClaim: ClaimRequest = {
      ...claimData,
      id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    claims.unshift(newClaim);
    setStored(STORAGE_KEYS.CLAIMS, claims);

    // Update item status to 'in_claim'
    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    const item = items.find((i) => i.id === claimData.item_id);
    if (item) {
      item.status = 'in_claim';
      item.updated_at = new Date().toISOString();
      setStored(STORAGE_KEYS.ITEMS, items);

      // Notify the finder of the item
      await this.createNotification({
        recipient_id: item.user_id,
        event_type: 'claim_submitted',
        related_item_id: item.id,
        related_claim_id: newClaim.id,
        title: 'New Ownership Claim Received',
        message: `${claimData.claimant_name} has submitted a verification claim for "${item.item_name}".`,
      });
    }

    await this.logActivity(claimData.claimant_id, claimData.claimant_name, 'CLAIM_SUBMITTED', 'claim', newClaim.id, {
      itemId: claimData.item_id,
    });

    return newClaim;
  },

  async getUserClaims(userId: string): Promise<ClaimRequest[]> {
    const claims = getStored<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);
    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);

    return claims
      .filter((c) => c.claimant_id === userId)
      .map((c) => ({
        ...c,
        item: items.find((i) => i.id === c.item_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getItemClaims(itemId: string): Promise<ClaimRequest[]> {
    const claims = getStored<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);
    return claims.filter((c) => c.item_id === itemId);
  },

  async getAllClaims(): Promise<ClaimRequest[]> {
    const claims = getStored<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);
    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);

    return claims
      .map((c) => ({
        ...c,
        item: items.find((i) => i.id === c.item_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    reviewerId: string,
    reviewerNotes?: string
  ): Promise<ClaimRequest> {
    const claims = getStored<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);
    const index = claims.findIndex((c) => c.id === claimId);
    if (index === -1) throw new Error('Claim not found');

    const claim = claims[index];
    claim.status = status;
    claim.reviewed_by = reviewerId;
    if (reviewerNotes) claim.reviewer_notes = reviewerNotes;
    claim.updated_at = new Date().toISOString();
    claims[index] = claim;
    setStored(STORAGE_KEYS.CLAIMS, claims);

    // If claim approved or completed, update item status
    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    const item = items.find((i) => i.id === claim.item_id);

    if (item) {
      if (status === 'completed') {
        item.status = 'reunited';
        item.updated_at = new Date().toISOString();
        setStored(STORAGE_KEYS.ITEMS, items);
      } else if (status === 'rejected') {
        // Return item to active if no other active claims
        const otherActiveClaims = claims.some(
          (c) => c.item_id === item.id && c.id !== claim.id && ['pending', 'under_review'].includes(c.status)
        );
        if (!otherActiveClaims) {
          item.status = 'active';
          item.updated_at = new Date().toISOString();
          setStored(STORAGE_KEYS.ITEMS, items);
        }
      }
    }

    // Notify claimant of status change
    await this.createNotification({
      recipient_id: claim.claimant_id,
      event_type: 'claim_status_updated',
      related_item_id: claim.item_id,
      related_claim_id: claim.id,
      title: `Claim Status: ${status.replace('_', ' ').toUpperCase()}`,
      message: `Your ownership claim for "${item?.item_name || 'the item'}" has been updated to "${status.replace('_', ' ')}".`,
    });

    await this.logActivity(reviewerId, 'Staff/Admin', 'CLAIM_STATUS_UPDATED', 'claim', claim.id, {
      newStatus: status,
      notes: reviewerNotes,
    });

    return claim;
  },

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  async getUserNotifications(userId: string): Promise<InAppNotification[]> {
    const notifs = getStored<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifs
      .filter((n) => n.recipient_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markNotificationRead(id: string): Promise<void> {
    const notifs = getStored<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const notif = notifs.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const notifs = getStored<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.forEach((n) => {
      if (n.recipient_id === userId) n.is_read = true;
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  async createNotification(notifData: Omit<InAppNotification, 'id' | 'is_read' | 'created_at'>): Promise<InAppNotification> {
    const notifs = getStored<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif: InAppNotification = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  },

  // -------------------------------------------------------------
  // PLATFORM STATS & AUDIT LOGS
  // -------------------------------------------------------------
  async getPlatformStats(): Promise<PlatformStats> {
    const items = getStored<ItemReport[]>(STORAGE_KEYS.ITEMS, []);
    const users = getStored<UserProfile[]>(STORAGE_KEYS.USERS, []);
    const claims = getStored<ClaimRequest[]>(STORAGE_KEYS.CLAIMS, []);

    return {
      activeLostCount: items.filter((i) => i.report_type === 'lost' && i.status === 'active').length,
      activeFoundCount: items.filter((i) => i.report_type === 'found' && i.status === 'active').length,
      reunitedCount: items.filter((i) => i.status === 'reunited').length,
      totalUsersCount: users.length,
      pendingClaimsCount: claims.filter((c) => ['pending', 'under_review'].includes(c.status)).length,
      totalReportsCount: items.length,
    };
  },

  async logActivity(
    actorId: string,
    actorName: string,
    action: string,
    entityType: 'item' | 'claim' | 'match' | 'user',
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const logs = getStored<ActivityLog[]>(STORAGE_KEYS.LOGS, []);
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actor_id: actorId,
      actor_name: actorName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 200 logs
    setStored(STORAGE_KEYS.LOGS, logs.slice(0, 200));
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    return getStored<ActivityLog[]>(STORAGE_KEYS.LOGS, []);
  },

  // -------------------------------------------------------------
  // IMAGE STORAGE HELPER
  // -------------------------------------------------------------
  async uploadItemImage(file: File): Promise<string> {
    // If Supabase storage is configured, upload to 'findora-items' bucket
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('findora-items')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from('findora-items').getPublicUrl(filePath);
          return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to DataURL', err);
      }
    }

    // High quality DataURL storage for persistent offline / local demonstration
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};
