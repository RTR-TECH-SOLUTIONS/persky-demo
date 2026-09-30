// Demo cart + favorites in localStorage. TODO(real): coșul din motorul de comerț (Medusa) + cont client.
import { SHOP } from '../data/catalog';

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  img: string;
  qty: number;
}

const CART = 'persky-cart';
const FAV = 'persky-fav';
export const SHIPPING = 19.99;

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || '') as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: keep working for this page only
  }
}

export const readCart = (): CartItem[] => read<CartItem[]>(CART, []);

function writeCart(items: CartItem[]) {
  save(CART, items);
  window.dispatchEvent(new CustomEvent('cart:update', { detail: items }));
}

export function addToCart(item: Omit<CartItem, 'qty'>, qty = 1, open = true) {
  const items = readCart();
  const found = items.find((i) => i.id === item.id);
  if (found) found.qty = Math.min(99, found.qty + qty);
  else items.push({ ...item, qty });
  writeCart(items);
  if (open) window.dispatchEvent(new CustomEvent('cart:open'));
}

export function setQty(id: string, qty: number) {
  writeCart(readCart().map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)));
}

export const removeItem = (id: string) => writeCart(readCart().filter((i) => i.id !== id));
export const clearCart = () => writeCart([]);

export const readFav = (): string[] => read<string[]>(FAV, []);

export function toggleFav(id: string): boolean {
  const favs = readFav();
  const on = !favs.includes(id);
  const next = on ? [...favs, id] : favs.filter((f) => f !== id);
  save(FAV, next);
  window.dispatchEvent(new CustomEvent('fav:update', { detail: next }));
  return on;
}

export const count = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0);
export const subtotal = (items: CartItem[]) => items.reduce((s, i) => s + i.price * i.qty, 0);
export const shippingFor = (sub: number) => (sub === 0 || sub >= SHOP.freeShipping ? 0 : SHIPPING);

export const fmt = (n: number) =>
  `${n.toLocaleString('ro-RO', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} lei`;
