// src/composables/useUpdatePassword.ts
import { ref } from "vue";
import type { PasswordPolicy } from "../types";
import { validatePassword } from "./usePasswordRules";
import { trackSubmit, isoNow } from "../analytics/tracker";

/**
 * Handles password update flow:
 * - Validates new password
 * - Calls backend (mocked here)
 * - Tracks analytics
 * - Manages loading/error/success states
 */
export function useUpdatePassword(policy: PasswordPolicy) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);

  // Mock API for development (replace with real API in production)
  async function mockUpdatePassword(current: string, next: string) {
    await new Promise((r) => setTimeout(r, 500));
    if (current === "wrong")
      return { ok: false, message: "Incorrect current password" };
    if (next === "ErrorFail1!#")
      return { ok: false, message: "Server error. Try again." };
    return { ok: true };
  }

  // Main update function
  async function update(current: string, next: string): Promise<boolean> {
    error.value = null;
    success.value = false;
    const startedAt = isoNow();

    // Step 1: local validation
    const { valid, errors } = validatePassword(next, current, policy);
    if (!valid) {
      error.value = errors[0];
      return false;
    }

    // Step 2: API call
    loading.value = true;
    try {
      const res = await mockUpdatePassword(current, next);
      const finishedAt = isoNow();

      if (!res.ok) {
        // API error
        error.value = res.message ?? "Unknown error";
        trackSubmit({
          type: "password_change_error",
          startedAt,
          finishedAt,
          message: error.value,
        });
        return false;
      }

      // Success
      success.value = true;
      trackSubmit({
        type: "password_change_success",
        startedAt,
        finishedAt,
      });
      return true;
    } finally {
      // Always reset loading
      loading.value = false;
    }
  }

  return { loading, error, success, update };
}
