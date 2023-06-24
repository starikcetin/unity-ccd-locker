import { appInfo } from './appInfo';
import { hasValue, isValidSemver, isValidTimestamp } from '../utils';
import { UclInternalError } from '../errors';

export type Metadata = {
  version: string;
  timestamp: number;
};

function isValid(obj: Partial<Metadata>): obj is Metadata {
  if (!hasValue(obj)) {
    return false;
  }

  if (
    !hasValue(obj.version) ||
    typeof obj.version !== 'string' ||
    !isValidSemver(obj.version)
  ) {
    return false;
  }

  if (
    !hasValue(obj.timestamp) ||
    typeof obj.timestamp !== 'number' ||
    !isValidTimestamp(obj.timestamp)
  ) {
    return false;
  }

  return true;
}

function parse(raw: string): Metadata {
  const parsed = JSON.parse(raw);
  if (!isValid(parsed)) {
    throw new UclInternalError(`Invalid metadata. Metadata: '${raw}'`);
  }
  return parsed;
}

function serialize(metadata: Metadata): string {
  return JSON.stringify(metadata, Object.keys(metadata).sort(), 2);
}

function create(): Metadata {
  return {
    version: appInfo.version,
    timestamp: Date.now(),
  };
}

export const metadata = {
  parse,
  serialize,
  create,
};
