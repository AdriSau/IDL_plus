export interface ExtensionRuntimeContext {
  currentUrl: string;
  hostname: string;
}

export interface ReferenceLookupRequest {
  postalCode: string;
}

export interface ReferenceLookupResult {
  postalCode: string;
  averagePricePerSquareMeter: number;
  sourceLabel: string;
}

export interface ReferenceProvider {
  getReference(request: ReferenceLookupRequest): Promise<ReferenceLookupResult>;
}
