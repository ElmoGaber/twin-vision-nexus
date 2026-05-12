type OfflineLicenseStatus = 'active' | 'expired' | 'revoked' | 'paused';

export interface OfflineLicense {
  status: OfflineLicenseStatus;
  expiresAt: string;
  daysValid: number;
}

export interface OfflineUserRecord {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
  license: OfflineLicense;
}

interface OfflineSessionRecord {
  userId: string;
  email: string;
  startedAt: string;
}

const USERS_KEY = 'tvn.offline.users.v1';
const SESSION_KEY = 'tvn.offline.session.v1';
export const OFFLINE_AUTH_EVENT = 'tvn-offline-auth-changed';

const DEFAULT_LICENSE_DAYS = 14;

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getUsers = (): OfflineUserRecord[] =>
  safeParse<OfflineUserRecord[]>(localStorage.getItem(USERS_KEY), []);

const saveUsers = (users: OfflineUserRecord[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const emitOfflineAuthChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OFFLINE_AUTH_EVENT));
};

const defaultLicense = (): OfflineLicense => ({
  status: 'active',
  expiresAt: new Date(Date.now() + DEFAULT_LICENSE_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  daysValid: DEFAULT_LICENSE_DAYS,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashFallback = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `fallback_${Math.abs(hash)}`;
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const hashPassword = async (password: string): Promise<string> => {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoded = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest('SHA-256', encoded);
      return toHex(digest);
    }
  } catch {
    // Ignore and use fallback hash below.
  }

  return hashFallback(password);
};

const makeId = () => `offline_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const upsertOfflineUser = async (params: {
  email: string;
  password: string;
  fullName?: string;
  license?: Partial<OfflineLicense>;
}) => {
  const email = normalizeEmail(params.email);
  const users = getUsers();
  const existing = users.find((u) => u.email === email);
  const passwordHash = await hashPassword(params.password);

  const mergedLicense: OfflineLicense = {
    ...(existing?.license || defaultLicense()),
    ...(params.license || {}),
  };

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.fullName = params.fullName?.trim() || existing.fullName;
    existing.license = mergedLicense;
    saveUsers(users);
    return existing;
  }

  const created: OfflineUserRecord = {
    id: makeId(),
    email,
    fullName: params.fullName?.trim() || email.split('@')[0],
    passwordHash,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    license: mergedLicense,
  };

  users.push(created);
  saveUsers(users);
  return created;
};

export const createOfflineUser = async (params: {
  email: string;
  password: string;
  fullName: string;
}) => {
  const email = normalizeEmail(params.email);
  const users = getUsers();

  if (users.some((u) => u.email === email)) {
    throw new Error('already registered');
  }

  return upsertOfflineUser(params);
};

export const authenticateOffline = async (emailInput: string, password: string) => {
  const email = normalizeEmail(emailInput);
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return null;

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) return null;

  user.lastLoginAt = new Date().toISOString();
  saveUsers(users);
  return user;
};

export const startOfflineSession = (user: OfflineUserRecord) => {
  const session: OfflineSessionRecord = {
    userId: user.id,
    email: user.email,
    startedAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  emitOfflineAuthChanged();
};

export const clearOfflineSession = () => {
  localStorage.removeItem(SESSION_KEY);
  emitOfflineAuthChanged();
};

export const getOfflineSessionUser = (): OfflineUserRecord | null => {
  const session = safeParse<OfflineSessionRecord | null>(localStorage.getItem(SESSION_KEY), null);
  if (!session) return null;

  const users = getUsers();
  return users.find((u) => u.id === session.userId) || null;
};

export const getOfflineLicense = (userId: string): OfflineLicense | null => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  return user?.license || null;
};

export const syncOfflineLicense = (userId: string, license: Partial<OfflineLicense>) => {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  user.license = {
    ...user.license,
    ...license,
  };

  saveUsers(users);
};
