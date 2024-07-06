export const DAILY_REPORT_STOMACHACHE = {
  none: 1,
  mild: 2,
  moderate: 3,
  severe: 4,
} as const;

export const DAILY_REPORT_CONDITION = {
  well: 1,
  slightlyBelowAverage: 2,
  poor: 3,
  veryPoor: 4,
  terrible: 5,
} as const;

export const DAILY_REPORT_ARTHRITIS = {
  true: 1,
  false: 0,
} as const;

export const DAILY_REPORT_SKIN_LESIONS = {
  true: 1,
  false: 0,
} as const;

export const DAILY_REPORT_OCULAR_LESIONS = {
  true: 1,
  false: 0,
} as const;

export const DAILY_REPORT_ABDOMINAL = {
  none: 1,
  possible: 2,
  definite: 3,
} as const;

export const DAILY_REPORT_ANORECTALLESITIONS = {
  fistula: {
    true: 1,
    false: 0,
  },
  others: {
    true: 1,
    false: 0,
  },
};

export const DAILY_REPORT_DEFAULT_DATA_INFO = {
  limit: 20,
  offset: 0,
} as const;
