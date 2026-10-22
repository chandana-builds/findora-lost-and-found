import { ItemReport, ItemMatch, MatchReason } from '../types';

/**
 * Text tokenization and similarity (Jaccard + subword overlap)
 */
function tokenize(text: string): Set<string> {
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'with', 'by', 'it', 'is', 'was', 'my', 'i'
  ]);
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = cleaned
    .split(/\s+/)
    .filter(t => t.length > 1 && !stopWords.has(t));
  return new Set(tokens);
}

function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  const setA = tokenize(text1);
  const setB = tokenize(text2);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  setA.forEach(token => {
    if (setB.has(token)) {
      intersectionCount++;
    } else {
      // Check partial substring match (e.g. "iphone" in "iphone13")
      for (const b of setB) {
        if ((b.length > 3 && token.length > 3) && (b.includes(token) || token.includes(b))) {
          intersectionCount += 0.7;
          break;
        }
      }
    }
  });

  const unionCount = setA.size + setB.size - intersectionCount;
  return Math.min(1, Math.max(0, intersectionCount / (unionCount || 1)));
}

/**
 * Calculates date proximity score
 */
function calculateDateProximity(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1).getTime();
  const d2 = new Date(dateStr2).getTime();
  if (isNaN(d1) || isNaN(d2)) return 0.5;

  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 1.0;
  if (diffDays <= 3) return 0.85;
  if (diffDays <= 7) return 0.70;
  if (diffDays <= 14) return 0.50;
  if (diffDays <= 30) return 0.30;
  return 0.10;
}

/**
 * Calculate potential match between a lost report and a found report
 */
export function evaluateMatch(lost: ItemReport, found: ItemReport): ItemMatch | null {
  // Must be opposite report types
  if (lost.report_type === found.report_type) return null;
  // Ensure lost is lost and found is found
  const lostItem = lost.report_type === 'lost' ? lost : found;
  const foundItem = lost.report_type === 'found' ? lost : found;

  // Cannot match same item or resolved items
  if (lostItem.id === foundItem.id) return null;
  if (lostItem.status === 'reunited' || lostItem.status === 'withdrawn') return null;
  if (foundItem.status === 'reunited' || foundItem.status === 'withdrawn') return null;

  const reasons: MatchReason[] = [];

  // 1. Category Compatibility (Weight: 25%)
  const categoryWeight = 25;
  let categoryScore = 0;
  if (lostItem.category === foundItem.category) {
    categoryScore = 1.0;
    reasons.push({
      label: 'Identical Category',
      score: 1.0,
      weight: categoryWeight,
      details: `Both reported under ${lostItem.category}`
    });
  } else {
    // Electronics / Jewelry crossover or Other
    if (lostItem.category === 'Other' || foundItem.category === 'Other') {
      categoryScore = 0.4;
      reasons.push({
        label: 'Compatible Category',
        score: 0.4,
        weight: categoryWeight,
        details: 'Category overlaps with general classification'
      });
    }
  }

  // 2. Name & Description Similarity (Weight: 35%)
  const textWeight = 35;
  const nameSim = calculateTextSimilarity(lostItem.item_name, foundItem.item_name);
  const descSim = calculateTextSimilarity(
    `${lostItem.item_name} ${lostItem.description}`,
    `${foundItem.item_name} ${foundItem.description}`
  );
  const combinedTextScore = (nameSim * 0.6) + (descSim * 0.4);
  if (combinedTextScore > 0.15) {
    reasons.push({
      label: 'Title & Description Similarity',
      score: combinedTextScore,
      weight: textWeight,
      details: `${Math.round(combinedTextScore * 100)}% keyword match in title and descriptions`
    });
  }

  // 3. Location Similarity (Weight: 20%)
  const locWeight = 20;
  const locSim = calculateTextSimilarity(lostItem.location, foundItem.location);
  let locScore = locSim;
  let locDetails = 'Locations share common landmarks or words';
  if (lostItem.organization_type === foundItem.organization_type) {
    locScore = Math.min(1.0, locScore + 0.35);
    locDetails = `Same facility type (${lostItem.organization_type}) and location keywords`;
  }
  if (locScore > 0.2) {
    reasons.push({
      label: 'Location Proximity',
      score: locScore,
      weight: locWeight,
      details: locDetails
    });
  }

  // 4. Date Proximity (Weight: 10%)
  const dateWeight = 10;
  const dateScore = calculateDateProximity(lostItem.event_date, foundItem.event_date);
  const diffDays = Math.round(
    Math.abs(new Date(lostItem.event_date).getTime() - new Date(foundItem.event_date).getTime()) /
    (1000 * 60 * 60 * 24)
  );
  if (dateScore >= 0.3) {
    reasons.push({
      label: 'Timeline Proximity',
      score: dateScore,
      weight: dateWeight,
      details: `Reported events occurred within ${diffDays} day${diffDays === 1 ? '' : 's'} of each other`
    });
  }

  // 5. Attributes (Color, Brand, Features) (Weight: 10%)
  const attrWeight = 10;
  let attrScore = 0;
  const attrDetails: string[] = [];

  if (lostItem.brand && foundItem.brand && calculateTextSimilarity(lostItem.brand, foundItem.brand) > 0.6) {
    attrScore += 0.5;
    attrDetails.push(`Matching brand "${lostItem.brand}"`);
  }
  if (lostItem.color && foundItem.color && calculateTextSimilarity(lostItem.color, foundItem.color) > 0.6) {
    attrScore += 0.3;
    attrDetails.push(`Matching color "${lostItem.color}"`);
  }
  if (lostItem.identifying_features && foundItem.identifying_features) {
    const featureSim = calculateTextSimilarity(lostItem.identifying_features, foundItem.identifying_features);
    if (featureSim > 0.2) {
      attrScore += 0.2;
      attrDetails.push('Similar distinct identifying traits');
    }
  }
  attrScore = Math.min(1.0, attrScore);
  if (attrScore > 0.2) {
    reasons.push({
      label: 'Attributes & Brand',
      score: attrScore,
      weight: attrWeight,
      details: attrDetails.join('; ')
    });
  }

  // Total weighted score
  const totalScore = Math.round(
    (categoryScore * categoryWeight) +
    (combinedTextScore * textWeight) +
    (locScore * locWeight) +
    (dateScore * dateWeight) +
    (attrScore * attrWeight)
  );

  // Return match if threshold is met (e.g. score >= 35%)
  if (totalScore >= 35) {
    return {
      id: `match_${lostItem.id}_${foundItem.id}`,
      lost_item_id: lostItem.id,
      found_item_id: foundItem.id,
      match_score: Math.min(100, Math.max(0, totalScore)),
      match_reasons: reasons,
      status: 'potential',
      lost_item: lostItem,
      found_item: foundItem,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return null;
}

/**
 * Scan all items to find all potential matches for a target item
 */
export function findMatchesForItem(target: ItemReport, allItems: ItemReport[]): ItemMatch[] {
  const matches: ItemMatch[] = [];
  for (const item of allItems) {
    if (item.id === target.id) continue;
    if (item.report_type === target.report_type) continue;

    const lost = target.report_type === 'lost' ? target : item;
    const found = target.report_type === 'found' ? target : item;
    const match = evaluateMatch(lost, found);
    if (match) {
      matches.push(match);
    }
  }

  // Sort descending by match score
  return matches.sort((a, b) => b.match_score - a.match_score);
}
