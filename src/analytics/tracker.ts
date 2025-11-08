export type SubmitPayload =
  | {
      type: "password_change_success";
      startedAt: string;
      finishedAt: string;
      /** optional if you’re not running A/B */
      testId?: string;
      variant?: string;
    }
  | {
      type: "password_change_error";
      startedAt: string;
      finishedAt: string;
      message: string;
      /** optional if you’re not running A/B */
      testId?: string;
      variant?: string;
    };

export function isoNow(): string {
  return new Date().toISOString();
}

export async function trackSubmit(ev: SubmitPayload) {
  console.log("[analytics]", JSON.stringify(ev));
}
