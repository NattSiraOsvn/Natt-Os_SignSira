
import { EInvoice, EInvoiceItem, VaultStatus } from '../types';

export interface TCTResponse {
  code: '00' | '10' | '99' | '401';
  message: string;
  taxAuthCode?: string;
  receivedDate?: string;
}

export interface InternalSyncResponse {
  status: 'SYNCED' | 'failED';
  shardId: string;
  blockIndex: number;
  internalHash: string;
}

export interface TokenProvider {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logo: string;
  status: string;
  expiry: string;
  serial: string;
}

export interface SigningMethod {
  id: 'HSM' | 'REMOTE' | 'P12' | 'USB';
  label: string;
  subLabel: string;
  icon: string;
  speed: string;
  scale: 'UNLIMITED' | 'HIGH' | 'MEDIUM' | 'SINGLE';
  security: 'ENTERPRISE' | 'CLOUD' | 'VIRTUAL' | 'PHYSICAL';
  description: string;
}

export class EInvoiceEngine {
  static getTokenProviders(): TokenProvider[] {
    return [
      { id: 'vettel', name: 'Tập đoàn Công nghiệp - Viễn thông Quân đội', shortName: 'Viettel-CA', color: 'bg-red-600', logo: '🛡️', status: 'ACTIVE', expiry: '2026-12-31', serial: '5404.0411.2332' },
      { id: 'vnpt', name: 'Tập đoàn Bưu chính Viễn thông Việt Nam', shortName: 'VNPT-CA', color: 'bg-blue-600', logo: '🌐', status: 'ACTIVE', expiry: '2027-05-20', serial: '8892.1122.9901' },
      { id: 'safeca', name: 'Công ty Cổ phần Chứng số An toàn', shortName: 'SafeCA', color: 'bg-amber-500', logo: '🔐', status: 'ACTIVE', expiry: '2027-01-15', serial: '7721.4455.1011' }
    ];
  }

  static getSigningMethods(): SigningMethod[] {
    return [
      { id: 'HSM', label: 'HSM Enterprise', subLabel: 'Hardware Security Module', icon: '🚀', speed: '10k+ TPS', scale: 'UNLIMITED', security: 'ENTERPRISE', description: 'Ký tự động hàng loạt cực nhanh.' },
      { id: 'USB', label: 'USB Token', subLabel: 'Physical Key', icon: '🔑', speed: 'Manual', scale: 'SINGLE', security: 'PHYSICAL', description: 'Bảo mật vật lý tối đa.' }
    ];
  }

  // CHANNEL 1: TỔNG CỤC THUẾ (IP_GATEWAY_TCT)
  static async transmitToTCT(signedXml: string): Promise<TCTResponse> {
    await new Promise(r => setTimeout(r, 2500)); // Giả lập độ trễ API Thuế
    return {
      code: '00',
      message: 'TCT Chấp nhận gói tin hóa đơn',
      taxAuthCode: `CQT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      receivedDate: new Date().toISOString()
    };
  }

  // CHANNEL 2: DL NGUỒN NỘI BỘ (IP_MASTER_LEDGER)
  static async syncToInternalLedger(signedXml: string, signatureHash: string): Promise<InternalSyncResponse> {
    await new Promise(r => setTimeout(r, 1500)); // Shard nội bộ thường nhanh hơn
    return {
      status: 'SYNCED',
      shardId: 'TAM-LUXURY-MASTER-SHARD',
      blockIndex: Math.floor(Math.random() * 99999),
      internalHash: signatureHash
    };
  }

  static async performSigning(xml: string, method: string): Promise<{ signedXml: string, hash: string }> {
    await new Promise(r => setTimeout(r, 1200));
    const hash = 'SHA256:' + Math.random().toString(16).slice(2, 40).toUpperCase();
    return { signedXml: xml + `<Signature>${hash}</Signature>`, hash };
  }
}
