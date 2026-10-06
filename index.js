/**
 * @format
 */

import React from 'react';
import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

// FCM background handler — must be registered before AppRegistry
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('[FCM] Background message:', remoteMessage);
});

// Notifee background event handler — handles notification taps when app is closed
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('[Notifee] Background press:', detail.notification?.data);
  }
});

const originalTextRender = Text.render;
Text.render = function (...args) {
  const origin = originalTextRender.apply(this, args);
  return React.cloneElement(origin, { allowFontScaling: false });
};

const originalTextInputRender = TextInput.render;
TextInput.render = function (...args) {
  const origin = originalTextInputRender.apply(this, args);
  return React.cloneElement(origin, { allowFontScaling: false });
};

AppRegistry.registerComponent(appName, () => App);
