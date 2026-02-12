export const API_BASE_URL = process.env.API_URL || 'http://10.0.2.2:3000/api';
export const SOCKET_URL = process.env.SOCKET_URL || 'http://10.0.2.2:3000';

export const STORAGE_KEYS = {
  TOKEN: '@nightwatch_token',
  USER: '@nightwatch_user',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  WATCHER: 'watcher',
};

export const COLORS = {
  PRIMARY: '#1e40af',
  SECONDARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  BACKGROUND: '#f3f4f6',
  SURFACE: '#ffffff',
  TEXT: '#1f2937',
  TEXT_SECONDARY: '#6b7280',
  BORDER: '#e5e7eb',
};

export const EVENT_TYPES = {
  INCIDENT: 'incident',
  OBSERVATION: 'observation',
};

export const EVENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};