export interface ExtensionRuntimeContext {
  currentUrl: string;
  hostname: string;
}

export type PageDetectionStatus =
  | 'unsupported'
  | 'supported_non_listing'
  | 'listing_candidate'
  | 'listing_ready';

export type LifecycleTrigger =
  | 'initial_load'
  | 'history_push'
  | 'history_replace'
  | 'popstate'
  | 'hashchange'
  | 'dom_mutation';

export interface PageDetectionSignal {
  source: 'url' | 'dom' | 'document';
  name: string;
}

export interface IdealistaPageDetection {
  status: PageDetectionStatus;
  url: string;
  hostname: string;
  pathname: string;
  listingId: string | null;
  reason: string;
  signals: PageDetectionSignal[];
}

export interface ListingPageContext {
  lifecycleKey: string;
  url: string;
  pathname: string;
  hostname: string;
  listingId: string | null;
  detectedAt: number;
  detectionStatus: Extract<PageDetectionStatus, 'listing_candidate' | 'listing_ready'>;
}

export interface NavigationChangeEvent {
  trigger: LifecycleTrigger;
  previousUrl: string;
  currentUrl: string;
}

export interface ContentLifecycleState {
  lastProcessedKey: string | null;
  activePageContext: ListingPageContext | null;
  lastDetection: IdealistaPageDetection | null;
}

export interface BootstrapContentInput {
  detection?: IdealistaPageDetection;
  previousPageContext?: ListingPageContext | null;
}

export interface BootstrapContentResult {
  outcome: 'mounted' | 'skipped';
  reason: string;
  detection: IdealistaPageDetection;
  pageContext: ListingPageContext | null;
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
