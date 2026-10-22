import { describe, it, expect } from 'vitest';
import { evaluateMatch, findMatchesForItem } from '../utils/matchingEngine';
import { ItemReport } from '../types';

describe('Smart Matching Engine', () => {
  const lostMacBook: ItemReport = {
    id: 'lost_mbp_1',
    user_id: 'user_alex',
    report_type: 'lost',
    item_name: 'Apple MacBook Pro 14"',
    category: 'Electronics',
    description: 'Space Gray laptop with React and GitHub stickers on lid',
    identifying_features: 'Serial ending in 77XG',
    color: 'Space Gray',
    brand: 'Apple',
    event_date: '2026-10-18',
    location: 'Central University Library - 2nd Floor Study Room',
    organization_type: 'Library',
    status: 'active',
    created_at: '2026-10-18T10:00:00Z',
    updated_at: '2026-10-18T10:00:00Z',
  };

  const foundMacBook: ItemReport = {
    id: 'found_mbp_2',
    user_id: 'user_sarah',
    report_type: 'found',
    item_name: 'Apple MacBook Laptop',
    category: 'Electronics',
    description: 'Found a space gray Apple laptop left on 2nd floor desk',
    identifying_features: 'Stickers on exterior lid',
    color: 'Space Gray',
    brand: 'Apple',
    event_date: '2026-10-18',
    location: 'Central University Library - 2nd Floor Study Room',
    organization_type: 'Library',
    status: 'active',
    created_at: '2026-10-18T12:00:00Z',
    updated_at: '2026-10-18T12:00:00Z',
  };

  const lostKeys: ItemReport = {
    id: 'lost_keys_3',
    user_id: 'user_marcus',
    report_type: 'lost',
    item_name: 'Car Keys on Red Lanyard',
    category: 'Keys',
    description: 'Toyota car key fob on red lanyard',
    event_date: '2026-10-10',
    location: 'Hospital Parking Lot',
    organization_type: 'Hospital / Healthcare',
    status: 'active',
    created_at: '2026-10-10T10:00:00Z',
    updated_at: '2026-10-10T10:00:00Z',
  };

  it('matches highly compatible lost and found reports', () => {
    const match = evaluateMatch(lostMacBook, foundMacBook);
    expect(match).not.toBeNull();
    expect(match?.match_score).toBeGreaterThanOrEqual(60);
    expect(match?.lost_item_id).toBe(lostMacBook.id);
    expect(match?.found_item_id).toBe(foundMacBook.id);
    expect(match?.match_reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('strictly rejects matching reports of the same report_type', () => {
    const secondLost: ItemReport = { ...foundMacBook, id: 'lost_2', report_type: 'lost' };
    const match = evaluateMatch(lostMacBook, secondLost);
    expect(match).toBeNull();
  });

  it('does not produce matches for completely distinct categories and locations', () => {
    const match = evaluateMatch(lostKeys, foundMacBook);
    expect(match).toBeNull();
  });

  it('does not match already reunited items', () => {
    const reunitedItem: ItemReport = { ...foundMacBook, status: 'reunited' };
    const match = evaluateMatch(lostMacBook, reunitedItem);
    expect(match).toBeNull();
  });

  it('finds all potential matches from a catalog of items', () => {
    const catalog = [lostMacBook, foundMacBook, lostKeys];
    const matches = findMatchesForItem(lostMacBook, catalog);
    expect(matches.length).toBe(1);
    expect(matches[0].found_item_id).toBe(foundMacBook.id);
  });
});
