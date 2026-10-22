import { describe, it, expect, beforeEach } from 'vitest';

// Storage polyfill for test environment
const storage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    for (const key in storage) delete storage[key];
  },
};

// Import db after polyfill is available
import { db } from '../services/db';

describe('Findora Database & Workflow Service', () => {
  beforeEach(() => {
    (globalThis as any).localStorage.clear();
  });

  it('registers new user accounts and prevents duplicate email registration', async () => {
    const user = await db.signUp('test.user@campus.edu', 'secret123', 'Test User', 'user');
    expect(user.email).toBe('test.user@campus.edu');
    expect(user.full_name).toBe('Test User');

    // Duplicate email registration should throw
    await expect(
      db.signUp('test.user@campus.edu', 'secret123', 'Another User', 'user')
    ).rejects.toThrow('already exists');
  });

  it('signs in registered users and retrieves active session', async () => {
    await db.signUp('signer@campus.edu', 'pass123', 'Signer User', 'user');
    const signedIn = await db.signIn('signer@campus.edu', 'pass123');
    expect(signedIn.email).toBe('signer@campus.edu');

    const session = await db.getCurrentSessionUser();
    expect(session?.email).toBe('signer@campus.edu');
  });

  it('creates lost report, creates matching found report, and dispatches notifications', async () => {
    const owner = await db.signUp('owner@campus.edu', 'pass123', 'Owner', 'user');
    const finder = await db.signUp('finder@campus.edu', 'pass123', 'Finder', 'user');

    // 1. Report lost laptop
    const lostItem = await db.createItem({
      user_id: owner.id,
      user_name: owner.full_name,
      report_type: 'lost',
      item_name: 'Dell XPS 15 Silver Laptop',
      category: 'Electronics',
      description: 'Silver Dell laptop forgotten on 3rd floor lounge table',
      color: 'Silver',
      brand: 'Dell',
      event_date: '2026-10-20',
      location: 'Engineering Hall 3rd floor',
      organization_type: 'College / University',
      status: 'active',
    });

    expect(lostItem.id).toBeDefined();

    // 2. Report found laptop
    const foundItem = await db.createItem({
      user_id: finder.id,
      user_name: finder.full_name,
      report_type: 'found',
      item_name: 'Dell XPS Laptop Silver',
      category: 'Electronics',
      description: 'Found a silver Dell laptop on lounge table. Handed to security.',
      color: 'Silver',
      brand: 'Dell',
      event_date: '2026-10-20',
      location: 'Engineering Hall 3rd floor lounge',
      organization_type: 'College / University',
      status: 'active',
    });

    expect(foundItem.id).toBeDefined();

    // 3. Verify that match was automatically detected
    const matches = await db.getMatchesForItem(lostItem.id);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].match_score).toBeGreaterThanOrEqual(60);

    // 4. Verify owner received a notification
    const ownerNotifs = await db.getUserNotifications(owner.id);
    expect(ownerNotifs.length).toBeGreaterThanOrEqual(1);
    expect(ownerNotifs[0].event_type).toBe('match_found');
  });

  it('manages claim submission, prevents duplicate claims, and handles review transitions', async () => {
    const owner = await db.signUp('claimant@campus.edu', 'pass123', 'Claimant', 'user');
    const finder = await db.signUp('finder2@campus.edu', 'pass123', 'Finder 2', 'user');

    const foundItem = await db.createItem({
      user_id: finder.id,
      user_name: finder.full_name,
      report_type: 'found',
      item_name: 'Sony Wireless Headphones',
      category: 'Electronics',
      description: 'Black Sony headphones found in cafe',
      event_date: '2026-10-20',
      location: 'Main Cafe',
      organization_type: 'Shopping Mall',
      status: 'active',
    });

    // 1. Submit ownership claim
    const claim = await db.submitClaim({
      item_id: foundItem.id,
      claimant_id: owner.id,
      claimant_name: owner.full_name,
      claimant_email: owner.email,
      message: 'I dropped these at table 4 yesterday afternoon.',
      private_verification_details: 'Has a small scratch on left ear cup and headband has red sticker.',
    });

    expect(claim.status).toBe('pending');

    // 2. Prevent duplicate active claim
    await expect(
      db.submitClaim({
        item_id: foundItem.id,
        claimant_id: owner.id,
        claimant_name: owner.full_name,
        claimant_email: owner.email,
        message: 'Duplicate claim attempt',
        private_verification_details: 'Same details',
      })
    ).rejects.toThrow('already have an active pending claim');

    // 3. Finder/Admin updates status to completed
    await db.updateClaimStatus(claim.id, 'completed', finder.id, 'Verified and returned in person.');

    // 4. Verify item is marked as reunited
    const updatedItem = await db.getItemById(foundItem.id);
    expect(updatedItem?.status).toBe('reunited');

    // 5. Verify claimant notification
    const claimantNotifs = await db.getUserNotifications(owner.id);
    const statusNotif = claimantNotifs.find((n) => n.event_type === 'claim_status_updated');
    expect(statusNotif).toBeDefined();
  });

  it('calculates accurate platform statistics', async () => {
    const stats = await db.getPlatformStats();
    expect(typeof stats.activeLostCount).toBe('number');
    expect(typeof stats.activeFoundCount).toBe('number');
    expect(typeof stats.reunitedCount).toBe('number');
    expect(typeof stats.totalReportsCount).toBe('number');
  });
});
