import { SmartLinkEventEmitter } from '../../ports/SmartLinkEventEmitter';

export class SmartLinkEventEmitterAdapter implements SmartLinkEventEmitter {
  async emitLinkCreated(linkId: string, sourceKey: string, targetKey: string) {
    console.log('[SMARTLINK-CELL] SmartLink.created:', { linkId, sourceKey, targetKey });
  }
  async emitLinkDeleted(linkId: string) {
    console.log('[SMARTLINK-CELL] SmartLink.deleted:', { linkId });
  }
  async emitLinkAccessed(linkId: string) {
    console.log('[SMARTLINK-CELL] SmartLink.accessed:', { linkId });
  }
}
