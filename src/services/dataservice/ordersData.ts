import path from 'node:path';
import { readCsv, writeCsv, appendCsvRow } from '../../lib/csv';
import { config } from '../../config/env';

const FILE = path.join(config.dataDir, 'orders.csv');
const HEADERS = ['orderId', 'bookName', 'author', 'format', 'userEmail', 'originalFileId', 'translatedFileId', 'createdAt', 'updatedAt'] as const;

export type Order = {
  orderId: string;
  bookName: string;
  author: string;
  format: string;
  userEmail?: string;
  originalFileId?: string;
  translatedFileId?: string;
  createdAt: string;
  updatedAt?: string;
};

export async function listOrders(): Promise<Order[]> {
  const rows = await readCsv(FILE, [...HEADERS]);
  return rows.map(r => ({
    orderId: r.orderId,
    bookName: r.bookName,
    author: r.author,
    format: r.format,
    userEmail: r.userEmail || undefined,
    originalFileId: r.originalFileId || undefined,
    translatedFileId: r.translatedFileId || undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt || undefined,
  }));
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const all = await listOrders();
  return all.find(o => o.orderId === id);
}

export async function addOrder(order: Order): Promise<void> {
  await appendCsvRow(FILE, [...HEADERS], {
    orderId: order.orderId,
    bookName: order.bookName,
    author: order.author,
    format: order.format,
    userEmail: order.userEmail ?? '',
    originalFileId: order.originalFileId ?? '',
    translatedFileId: order.translatedFileId ?? '',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt ?? '',
  });
}

export async function updateOrder(id: string, partial: Partial<Order>): Promise<Order | undefined> {
  const rows = await readCsv(FILE, [...HEADERS]);
  let found: any;
  const updated = rows.map(r => {
    if (r.orderId === id) {
      found = { ...r, ...Object.fromEntries(Object.entries(partial).map(([k, v]) => [k, String(v ?? '')])) };
      found.updatedAt = new Date().toISOString();
      return found;
    }
    return r;
  });
  await writeCsv(FILE, [...HEADERS], updated);
  if (!found) return undefined;
  return {
    orderId: found.orderId,
    bookName: found.bookName,
    author: found.author,
    format: found.format,
    userEmail: found.userEmail || undefined,
    originalFileId: found.originalFileId || undefined,
    translatedFileId: found.translatedFileId || undefined,
    createdAt: found.createdAt,
    updatedAt: found.updatedAt || undefined,
  };
}

export async function deleteOrder(id: string): Promise<boolean> {
  const rows = await readCsv(FILE, [...HEADERS]);
  const next = rows.filter(r => r.orderId !== id);
  const deleted = next.length !== rows.length;
  await writeCsv(FILE, [...HEADERS], next);
  return deleted;
}