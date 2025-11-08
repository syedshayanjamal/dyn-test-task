// Defines the rules used to validate a password
export type PasswordPolicy = {
  minLength: number; // Minimum length required
  requireUpper: boolean; // Must contain at least one uppercase letter (A–Z)
  requireLower: boolean; // Must contain at least one lowercase letter (a–z)
  requireDigit: boolean; // Must contain at least one number (0–9)
  requireSymbol: boolean; // Must contain at least one special character (!@# etc.)
  significantDiff: number; // Minimum number of characters that must differ from the old password
};

// Standard result type for password update operations
export type UpdateResult =
  | { ok: true } // Successful update
  | { ok: false; message: string }; // Failed update with error message
