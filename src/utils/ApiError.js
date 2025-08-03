class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.errors = errors;

    // Capture stack trace only if it's not provided
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      data: this.data,
      errors: this.errors,
      message: this.message,
    };
  }
}

export { ApiError };
