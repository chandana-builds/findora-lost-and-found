export type ReportType = 'lost' | 'found';

export type ItemStatus = 'active' | 'in_claim' | 'reunited' | 'closed' | 'withdrawn';

export type Category =
  | 'Electronics'
  | 'Documents & IDs'
  | 'Bags & Wallets'
  | 'Keys'
  | 'Clothing & Footwear'
  | 'Books & Stationery'
  | 'Jewelry & Accessories'
  | 'Medical & Health'
  | 'Other';

export type OrganizationType =
  | 'College / University'
  | 'School'
  | 'Hospital / Healthcare'
  | 'Office / Corporate'
  | 'Shopping Mall'
  | 'Library'
  | 'Public Transit / Station'
  | 'Public Park / Street'
  | 'Airport'
  | 'Other Location';

export type ClaimStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemReport {
  id: string;
  user_id: string;
  user_name?: string;
  report_type: ReportType;
  item_name: string;
  category: Category;
  description: string;
  identifying_features?: string;
  color?: string;
  brand?: string;
  event_date: string;
  location: string;
  organization_type: OrganizationType;
  image_path?: string;
  status: ItemStatus;
  contact_preference?: 'in_app' | 'email' | 'phone';
  created_at: string;
  updated_at: string;
}

export interface MatchReason {
  label: string;
  score: number;
  weight: number;
  details: string;
}

export interface ItemMatch {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  match_score: number; // 0 - 100
  match_reasons: MatchReason[];
  status: 'potential' | 'dismissed' | 'confirmed';
  lost_item?: ItemReport;
  found_item?: ItemReport;
  created_at: string;
  updated_at: string;
}

export interface ClaimRequest {
  id: string;
  item_id: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
  message: string;
  private_verification_details: string;
  status: ClaimStatus;
  reviewed_by?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
  item?: ItemReport;
}

export interface InAppNotification {
  id: string;
  recipient_id: string;
  event_type: 'match_found' | 'claim_submitted' | 'claim_status_updated' | 'item_reunited' | 'report_updated' | 'system';
  related_item_id?: string;
  related_claim_id?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string;
  actor_name?: string;
  action: string;
  entity_type: 'item' | 'claim' | 'match' | 'user';
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PlatformStats {
  activeLostCount: number;
  activeFoundCount: number;
  reunitedCount: number;
  totalUsersCount: number;
  pendingClaimsCount: number;
  totalReportsCount: number;
}
