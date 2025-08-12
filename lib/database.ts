// lib/database.ts
// Lightweight in-memory data store with typed helpers matching your Prisma models.
// Works out-of-the-box locally; you can swap internals to Prisma later without
// changing API routes.

export type UserSettings = {
  notifications?: any;
  display?: any;
  privacy?: any;
  api?: any;
};

export type Alert = {
  id: string;
  userId: string;
  name: string;
  type: string;
  condition?: string;
  value?: number;
  priority: "low" | "medium" | "high" | string;
  isActive: boolean;
  triggered: boolean;
  createdAt: string; // ISO
};

export type SearchEntry = {
  id: string;
  userId: string;
  query: string;
  category: string;
  timestamp: string; // ISO
};

export type User = {
  id: string;
  walletAddress: string;
  createdAt: string; // ISO
  lastLogin: string; // ISO
  premiumStatus: boolean;
  alerts: Alert[];
  searches: SearchEntry[];
  settings?: UserSettings;
};

// ---------- In-memory store ----------

const usersByWallet = new Map<string, User>();

function nowISO() {
  return new Date().toISOString();
}

function uuid() {
  // Use crypto.randomUUID when available (Node 18+ / modern browsers)
  // Fallback is fine for local use.
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id_${Math.random().toString(36).slice(2)}_${Date.now()}`
  );
}

// ---------- User helpers ----------

export function getOrCreateUser(wallet: string): User {
  const key = wallet.trim();
  const existing = usersByWallet.get(key);
  if (existing) {
    existing.lastLogin = nowISO();
    return existing;
  }

  const user: User = {
    id: uuid(),
    walletAddress: key,
    createdAt: nowISO(),
    lastLogin: nowISO(),
    premiumStatus: false,
    alerts: [],
    searches: [],
    settings: {},
  };
  usersByWallet.set(key, user);
  return user;
}

// Kept async because some routes already `await` it.
// (You can make this sync if you prefer and update call sites.)
export async function getUser(wallet: string): Promise<User | null> {
  return usersByWallet.get(wallet.trim()) ?? null;
}

export function updateUserSettings(
  wallet: string,
  partial: Partial<UserSettings>
): User | null {
  const u = usersByWallet.get(wallet.trim());
  if (!u) return null;
  u.settings = { ...(u.settings ?? {}), ...(partial ?? {}) };
  return u;
}

// ---------- Alerts ----------

export function getAlerts(wallet: string): Alert[] {
  const u = usersByWallet.get(wallet.trim());
  return u ? [...u.alerts] : [];
}

export function createAlert(
  wallet: string,
  data: Partial<Omit<Alert, "id" | "userId" | "createdAt">>
): Alert {
  const u = getOrCreateUser(wallet);
  const alert: Alert = {
    id: uuid(),
    userId: u.id,
    name: data?.name ?? "Alert",
    type: data?.type ?? "price",
    condition: data?.condition,
    value: typeof data?.value === "number" ? data.value : undefined,
    priority: (data?.priority as Alert["priority"]) ?? "low",
    isActive: data?.isActive !== false,
    triggered: false,
    createdAt: nowISO(),
  };
  u.alerts.push(alert);
  return alert;
}

export function updateAlert(
  wallet: string,
  id: string,
  updates: Partial<Omit<Alert, "id" | "userId" | "createdAt">>
): Alert | null {
  const u = usersByWallet.get(wallet.trim());
  if (!u) return null;
  const i = u.alerts.findIndex((a) => a.id === id);
  if (i === -1) return null;
  const current = u.alerts[i];
  const next: Alert = {
    ...current,
    ...updates,
  };
  u.alerts[i] = next;
  return next;
}

export function deleteAlert(wallet: string, id: string): boolean {
  const u = usersByWallet.get(wallet.trim());
  if (!u) return false;
  const lenBefore = u.alerts.length;
  u.alerts = u.alerts.filter((a) => a.id !== id);
  return u.alerts.length < lenBefore;
}

// ---------- Search history ----------

export function addSearchHistory(
  wallet: string,
  query: string,
  category = ""
): SearchEntry {
  const u = getOrCreateUser(wallet);
  const entry: SearchEntry = {
    id: uuid(),
    userId: u.id,
    query,
    category,
    timestamp: nowISO(),
  };
  u.searches.unshift(entry);
  // Trim to a reasonable length to avoid unbounded growth locally
  if (u.searches.length > 200) u.searches.length = 200;
  return entry;
}

// NEW: expose read helper used by export route
export function getSearchHistory(wallet: string): SearchEntry[] {
  const u = usersByWallet.get(wallet.trim());
  return u ? [...u.searches] : [];
}
