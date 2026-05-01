import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getApp } from 'firebase/app';
import './firebase-app.web.js';

function getAuthInstance() {
  try {
    return initializeAuth(getApp(), {
      persistence: browserLocalPersistence,
      // Force classic reCAPTCHA, disable Enterprise
      popupRedirectResolver: undefined,
    });
  } catch {
    return getAuth(); // already initialized
  }
}

function getRecaptcha() {
  if (!window._recaptchaVerifier) {
    window._recaptchaVerifier = new RecaptchaVerifier(getAuthInstance(), 'recaptcha-container', { size: 'invisible' });
  }
  return window._recaptchaVerifier;
}

function auth() {
  return {
    signInWithPhoneNumber: function(phoneNumber) {
      return signInWithPhoneNumber(getAuthInstance(), phoneNumber, getRecaptcha()).then(function(confirmation) {
        return {
          confirm: function(code) { return confirmation.confirm(code); },
        };
      });
    },
  };
}

export default auth;
