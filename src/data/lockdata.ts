import { UclInternalError } from '../errors';
import { hasValue, isValidActorId, isValidTimestamp } from '../utils';

export type Lockdata = {
  isLocked: boolean;
  actorId: string;
  timestamp: number;
  message: string;
};

function isValid(obj: Partial<Lockdata>): obj is Lockdata {
  if (!hasValue(obj)) {
    return false;
  }

  if (!hasValue(obj.isLocked) || typeof obj.isLocked !== 'boolean') {
    return false;
  }

  if (
    !hasValue(obj.actorId) ||
    typeof obj.actorId !== 'string' ||
    !isValidActorId(obj.actorId)
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

  if (!hasValue(obj.message) || typeof obj.message !== 'string') {
    return false;
  }

  return true;
}

export function parse(raw: string): Lockdata {
  const parsed = JSON.parse(raw);
  if (!isValid(parsed)) {
    throw new UclInternalError(`Invalid lock data. Lockdata: '${raw}'`);
  }
  return parsed;
}

export function serialize(lockdata: Lockdata): string {
  return JSON.stringify(lockdata, Object.keys(lockdata).sort(), 2);
}

export function create(actorId: string): Lockdata {
  return {
    isLocked: false,
    actorId,
    timestamp: Date.now(),
    message: 'Created lock.',
  };
}

export const lockdata = {
  parse,
  serialize,
  create,
};
