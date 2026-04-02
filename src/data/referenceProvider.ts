import type {
  ReferenceLookupRequest,
  ReferenceLookupResult,
  ReferenceProvider
} from '../core/types';
import { NotImplementedExtensionError } from '../shared/errors';

export class UnconfiguredReferenceProvider implements ReferenceProvider {
  async getReference(
    _request: ReferenceLookupRequest
  ): Promise<ReferenceLookupResult> {
    throw new NotImplementedExtensionError(
      'Reference provider has not been configured yet.'
    );
  }
}
