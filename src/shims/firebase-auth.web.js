import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import './firebase-app.web.js';

function getRecaptcha() {
  if (!window._recaptchaVerifier) {
    window._recaptchaVerifier = new RecaptchaVerifier(getAuth(), 'recaptcha-container', { size: 'invisible' });
  }
  return window._recaptchaVerifier;
}

function auth() {
  return {
    signInWithPhoneNumber: function(phoneNumber) {
      return signInWithPhoneNumber(getAuth(), phoneNumber, getRecaptcha()).then(function(confirmation) {
        return {
          confirm: function(code) { return confirmation.confirm(code); },
        };
      });
    },
  };
}

export default auth;
