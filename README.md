# Password Change Flow (Vue 3 + TypeScript)

A simple password change flow built with Vue 3 + TypeScript.  
Includes validation, password toggle, and basic tracking.  
Fully responsive and works on both desktop and mobile.

---

## Project Structure Overview
```bash
src/
├─ components/
│  ├─ PasswordBox.vue              # Main password change form (2-step flow)
│  ├─ DynInput.vue                 # Reusable input with validation states
│  ├─ DynInputPasswordToggle.vue   # Eye icon to toggle password visibility
│  └─ ToastHost.vue                # For success or error messages display
│
├─ composables/
│  ├─ usePasswordRules.ts          # Validation logic (length, strength, similarity)
│  ├─ useInputPasswordToggle.ts    # Manages password visibility toggle
│  ├─ useUpdatePassword.ts         # Handles form submission, validation, and tracking
│  └─ useToast.ts                  # Manages global toast notifications
│
├─ analytics/
│  └─ tracker.ts                   # Simple analytics hook (console log + timestamps)
│
└─ tests/
   └─ password-rules.spec.ts       # Unit tests for password validation
```


---
## Key Decisions

Two Variants – The UI supports Inline-change (live validation hints) and Lean-save (minimal version).
              You can switch variants using the tabs at the top of the page.

Mobile Friendly – Built with TailwindCSS responsive utilities for all screen sizes.

Validation Rules – Based on custom PasswordPolicy with strength and difference checks.

Tracking – Lightweight analytics logs each submit with ISO timestamps (2025-10-02T09:30:00Z).

Mock API – Simulates server response for testing without backend setup.

Type Safety – All logic written in TypeScript for clarity and maintainability.

---

## Tracker

A lightweight tracker runs on every form submission.  
It logs:
- Event type (`success` or `error`)  
- Start and end timestamps in ISO format  
- Optional message for errors  

Example output in console:
-- Success
[analytics] {"type":"password_change_success","startedAt":"2025-11-08T20:04:34.575Z","finishedAt":"2025-11-08T20:04:35.076Z"}

-- Error
[analytics] {"type":"password_change_error","startedAt":"2025-11-08T20:07:20.074Z","finishedAt":"2025-11-08T20:07:20.575Z","message":"Server error. Try again."}


## How to Run

- Install dependencies:
```bash
npm install 

```
- Start your dev server:
```bash
npm run dev

```

- Build for production:
```bash
npm run build

```

- Run unit tests:
```bash
npm run test

```


## For Testing

- Start your dev server: 
```bash
npm run dev

```
- Open browser console.
- Try submitting form with following: 
  - For Success
    - Old Password: OldPassword1!
    - New Password: BrandNewPass1!#
  
  - For Error
    - Old Password: OldPassword1!
    - New Password: ErrorFail1!#
