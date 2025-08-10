import path from 'node:path';
import { appendCsvRow, readCsv, writeCsv } from '../../lib/csv';
import { config } from '../../config/env';

const PARTNER_FILE = path.join(config.dataDir, 'partners.csv');
const PARTNER_HEADERS = ['partnerId', 'type', 'name', 'endpoint', 'configJson', 'contact', 'createdAt'] as const;

const SHELF_FILE = path.join(config.dataDir, 'bookshelf.csv');
const SHELF_HEADERS = ['shelfId', 'title', 'composedMarkdownPath', 'epubPath', 'orderId', 'createdAt'] as const;

const SHIP_FILE = path.join(config.dataDir, 'shipments.csv');
const SHIP_HEADERS = ['shipmentId', 'orderId', 'partnerId', 'status', 'trackingNumber', 'createdAt'] as const;

export type Partner = { partnerId: string; type: 'print'|'ads'|'bookshelf'|'shipping'; name: string; endpoint?: string; config?: Record<string, unknown>; contact?: string; createdAt: string };
export type Shelf = { shelfId: string; title: string; composedMarkdownPath: string; epubPath?: string; orderId?: string; createdAt: string };
export type Shipment = { shipmentId: string; orderId: string; partnerId: string; status: string; trackingNumber?: string; createdAt: string };

export async function listPartners(): Promise<Partner[]> {
  const rows = await readCsv(PARTNER_FILE, [...PARTNER_HEADERS]);
  return rows.map(r => ({ partnerId: r.partnerId, type: r.type as Partner['type'], name: r.name, endpoint: r.endpoint || undefined, config: r.configJson ? JSON.parse(r.configJson) : undefined, contact: r.contact || undefined, createdAt: r.createdAt }));
}

export async function upsertPartner(p: Partner): Promise<void> {
  const rows = await readCsv(PARTNER_FILE, [...PARTNER_HEADERS]);
  const others = rows.filter(r => r.partnerId !== p.partnerId);
  await writeCsv(PARTNER_FILE, [...PARTNER_HEADERS], [...others, { partnerId: p.partnerId, type: p.type, name: p.name, endpoint: p.endpoint ?? '', configJson: p.config ? JSON.stringify(p.config) : '', contact: p.contact ?? '', createdAt: p.createdAt }] as any);
}

export async function deletePartner(partnerId: string): Promise<boolean> {
  const rows = await readCsv(PARTNER_FILE, [...PARTNER_HEADERS]);
  const next = rows.filter(r => r.partnerId !== partnerId);
  const deleted = next.length !== rows.length;
  await writeCsv(PARTNER_FILE, [...PARTNER_HEADERS], next);
  return deleted;
}

export async function listShelves(): Promise<Shelf[]> {
  const rows = await readCsv(SHELF_FILE, [...SHELF_HEADERS]);
  return rows.map(r => ({ shelfId: r.shelfId, title: r.title, composedMarkdownPath: r.composedMarkdownPath, epubPath: r.epubPath || undefined, orderId: r.orderId || undefined, createdAt: r.createdAt }));
}

export async function addShelf(s: Shelf): Promise<void> {
  await appendCsvRow(SHELF_FILE, [...SHELF_HEADERS], { shelfId: s.shelfId, title: s.title, composedMarkdownPath: s.composedMarkdownPath, epubPath: s.epubPath ?? '', orderId: s.orderId ?? '', createdAt: s.createdAt });
}

export async function deleteShelf(shelfId: string): Promise<boolean> {
  const rows = await readCsv(SHELF_FILE, [...SHELF_HEADERS]);
  const next = rows.filter(r => r.shelfId !== shelfId);
  const deleted = next.length !== rows.length;
  await writeCsv(SHELF_FILE, [...SHELF_HEADERS], next);
  return deleted;
}

export async function listShipments(): Promise<Shipment[]> {
  const rows = await readCsv(SHIP_FILE, [...SHIP_HEADERS]);
  return rows.map(r => ({ shipmentId: r.shipmentId, orderId: r.orderId, partnerId: r.partnerId, status: r.status, trackingNumber: r.trackingNumber || undefined, createdAt: r.createdAt }));
}

export async function addShipment(s: Shipment): Promise<void> {
  await appendCsvRow(SHIP_FILE, [...SHIP_HEADERS], { shipmentId: s.shipmentId, orderId: s.orderId, partnerId: s.partnerId, status: s.status, trackingNumber: s.trackingNumber ?? '', createdAt: s.createdAt });
}