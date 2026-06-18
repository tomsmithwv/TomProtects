export type CheckStatus = 'pass' | 'warn' | 'fail' | 'error' | 'not-found' | 'unknown';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface CheckResult {
  status: CheckStatus;
  record?: string | string[];
  details?: string;
}

export interface SPFCheck extends CheckResult {
  mechanisms?: number;
  hasPermError?: boolean;
}

export interface DKIMCheck extends CheckResult {
  found?: string[];
}

export interface DMARCCheck extends CheckResult {
  policy?: string;
  hasReporting?: boolean;
  modernizationTips?: string[];
}

export interface CheckerResponse {
  email: string;
  domain: string;
  grade: Grade;
  checks: {
    spf: SPFCheck;
    dkim: DKIMCheck;
    dmarc: DMARCCheck;
  };
  recommendations: string[];
  subscribed: boolean;
  message?: string;
}

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}
