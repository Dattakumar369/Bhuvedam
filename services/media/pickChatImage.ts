import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

import type { LanguageCode } from '@/constants/languages';
import { getTranslations } from '@/constants/i18n/translations';

export interface PickedChatImage {
  uri: string;
  base64: string;
}

export interface ChatImagePickerStrings {
  pickerTitle: string;
  pickerMessage: string;
  cameraOption: string;
  libraryOption: string;
  cancelOption: string;
  cameraPermissionTitle: string;
  cameraPermissionMessage: string;
  libraryPermissionTitle: string;
  libraryPermissionMessage: string;
  settingsLabel: string;
}

export function getChatImagePickerStrings(language: LanguageCode = 'te'): ChatImagePickerStrings {
  const t = getTranslations(language);
  return {
    pickerTitle: t.chatImagePickerTitle,
    pickerMessage: t.chatImagePickerMessage,
    cameraOption: t.chatImageCamera,
    libraryOption: t.chatImageLibrary,
    cancelOption: t.cancelEdit,
    cameraPermissionTitle: t.chatImageCameraPermissionTitle,
    cameraPermissionMessage: t.chatImageCameraPermissionMessage,
    libraryPermissionTitle: t.chatImageLibraryPermissionTitle,
    libraryPermissionMessage: t.chatImageLibraryPermissionMessage,
    settingsLabel: t.chatImageOpenSettings,
  };
}

async function ensurePermission(
  source: 'camera' | 'library',
  strings: ChatImagePickerStrings,
): Promise<boolean> {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') return true;
    Alert.alert(strings.cameraPermissionTitle, strings.cameraPermissionMessage, [
      { text: strings.cancelOption, style: 'cancel' },
      { text: strings.settingsLabel, onPress: () => void Linking.openSettings() },
    ]);
    return false;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === 'granted') return true;
  Alert.alert(strings.libraryPermissionTitle, strings.libraryPermissionMessage, [
    { text: strings.cancelOption, style: 'cancel' },
    { text: strings.settingsLabel, onPress: () => void Linking.openSettings() },
  ]);
  return false;
}

async function launchPicker(
  source: 'camera' | 'library',
  strings: ChatImagePickerStrings,
): Promise<PickedChatImage | null> {
  const allowed = await ensurePermission(source, strings);
  if (!allowed) return null;

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.7,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.7,
          base64: true,
        });

  if (result.canceled || !result.assets[0]?.uri) return null;

  const asset = result.assets[0];
  if (!asset.base64) return null;

  return { uri: asset.uri, base64: asset.base64 };
}

export async function pickChatImage(
  language: LanguageCode = 'te',
): Promise<PickedChatImage | null> {
  const strings = getChatImagePickerStrings(language);

  return new Promise((resolve) => {
    Alert.alert(strings.pickerTitle, strings.pickerMessage, [
      { text: strings.cameraOption, onPress: () => void launchPicker('camera', strings).then(resolve) },
      { text: strings.libraryOption, onPress: () => void launchPicker('library', strings).then(resolve) },
      { text: strings.cancelOption, style: 'cancel', onPress: () => resolve(null) },
    ]);

    if (Platform.OS === 'web') {
      void launchPicker('library', strings).then(resolve);
      return;
    }
  });
}
