import type {
  ListingDataExtractionResult,
  ListingFieldName,
  ListingFieldWarning,
  ListingSourceSignal
} from '../core/types';
import {
  collectAreaCandidates,
  collectPostalCodeCandidates,
  collectPriceCandidates,
  type ExtractionCandidate
} from './idealistaSelectors';
import {
  parseAreaSqm,
  parseEuropeanPrice,
  parseSpanishPostalCode
} from './parsers';

export function extractListingData(
  rootDocument: Document = document
): ListingDataExtractionResult {
  const warnings: ListingFieldWarning[] = [];
  const sourceSignals: ListingSourceSignal[] = [];

  const price = pickParsedCandidate(
    'price',
    collectPriceCandidates(rootDocument),
    parseEuropeanPrice,
    warnings,
    sourceSignals
  );

  const postalCode = pickParsedCandidate(
    'postalCode',
    collectPostalCodeCandidates(rootDocument),
    parseSpanishPostalCode,
    warnings,
    sourceSignals
  );

  const areaSqm = pickParsedCandidate(
    'areaSqm',
    collectAreaCandidates(rootDocument),
    parseAreaSqm,
    warnings,
    sourceSignals
  );

  const missingFields: ListingFieldName[] = [];
  if (price === null) {
    missingFields.push('price');
  }
  if (postalCode === null) {
    missingFields.push('postalCode');
  }
  if (areaSqm === null) {
    missingFields.push('areaSqm');
  }

  if (missingFields.length > 0) {
    warnings.push({
      field: missingFields[0],
      code: 'incomplete_listing_data',
      message: `listing extraction incomplete: missing ${missingFields.join(', ')}`
    });
  }

  return {
    data: {
      price,
      postalCode,
      areaSqm,
      currency: price === null ? null : 'EUR'
    },
    sourceSignals,
    missingFields,
    warnings,
    isComplete: missingFields.length === 0
  };
}

function pickParsedCandidate<T>(
  field: ListingFieldName,
  candidates: ExtractionCandidate[],
  parser: (rawValue: string) => T | null,
  warnings: ListingFieldWarning[],
  sourceSignals: ListingSourceSignal[]
): T | null {
  if (candidates.length === 0) {
    warnings.push({
      field,
      code: 'missing_value',
      message: `no candidate found for ${field}`
    });
    return null;
  }

  for (const candidate of candidates) {
    const parsedValue = parser(candidate.value);
    if (parsedValue === null) {
      continue;
    }

    sourceSignals.push({
      field,
      source: candidate.source,
      name: candidate.name,
      rawValue: candidate.value
    });
    return parsedValue;
  }

  warnings.push({
    field,
    code: field === 'postalCode' ? 'invalid_format' : 'parse_failed',
    message: `unable to parse ${field} from available candidates`
  });

  return null;
}
