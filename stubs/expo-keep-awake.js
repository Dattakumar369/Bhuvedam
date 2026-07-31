/** Dev stub — avoids "Unable to activate keep awake" in Expo Go on Android. */
export const ExpoKeepAwakeTag = 'ExpoKeepAwakeDefaultTag';

export function useKeepAwake() {}

export async function activateKeepAwakeAsync() {}

export async function deactivateKeepAwake() {}

export async function isAvailableAsync() {
  return false;
}

export function activateKeepAwake() {
  return activateKeepAwakeAsync();
}

export function addListener() {
  return { remove() {} };
}
