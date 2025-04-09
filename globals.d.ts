// globals.d.ts
import { RecaptchaVerifier } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export {};  // This ensures the file is treated as a module

  