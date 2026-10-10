export type MemberStatus = 'active' | 'suspended';

export function isValidClassRank(value: string): value is 'A' | 'B' | 'C' | 'E' | 'S' {
  return ['A', 'B', 'C', 'E', 'S'].includes(value);
}

export function isAdminRole(role: string): boolean {
  return ['teacher', 'director'].includes(role);
}

export function normalizeVirtualCoins(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
