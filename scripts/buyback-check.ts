// @ts-nocheck
import { VIETIN_TRANSACTIONS } from '../src/cells/business/finance-cell/domain/services/lctt-2025.data';

const buyback = VIETIN_TRANSACTIONS.filter(t =>
  t.moTa && (
    t.moTa.toLowerCase().includes('mua lại') ||
    t.moTa.toLowerCase().includes('buyback') ||
    t.moTa.toLowerCase().includes('thu hồi') ||
    t.moTa.toLowerCase().includes('mua lại sp') ||
    t.moTa.toLowerCase().includes('hoàn trả')
  )
);
console.log(`Buyback transactions: ${buyback.length}`);
buyback.forEach(t => console.log(`  ${t.ngay} | ${t.soTien?.toLocaleString()} | ${t.moTa?.slice(0,80)}`));
