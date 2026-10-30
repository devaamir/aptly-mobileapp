import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { Alert } from 'react-native';
import App from './App';

// Polyfill Alert for web
Alert.alert = (title, message, buttons) => {
  if (buttons && buttons.length > 1) {
    const confirmed = window.confirm(`${title}${message ? '\n\n' + message : ''}`);
    const btn = buttons.find(b => confirmed ? b.style !== 'cancel' : b.style === 'cancel');
    btn?.onPress?.();
  } else {
    window.alert(`${title}${message ? '\n\n' + message : ''}`);
    buttons?.[0]?.onPress?.();
  }
};

// Tell prerender.io to wait until the app signals it's ready.
// Screens call window.prerenderReady = true after their content has loaded.
// Without this, prerender.io snapshots the page while it's still blank.
if (typeof window !== 'undefined') {
  window.prerenderReady = false;
}

const root = createRoot(document.getElementById('root'));
root.render(createElement(App));
