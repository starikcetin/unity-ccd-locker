class UclError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, UclError.prototype);
  }
}

/** Unexpected errors. Likely due to a bug. */
export class UclInternalError extends UclError {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, UclInternalError.prototype);
  }
}

/** Expected errors. Likely due to user mistake. */
export class UclFailureError extends UclError {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, UclFailureError.prototype);
  }
}
