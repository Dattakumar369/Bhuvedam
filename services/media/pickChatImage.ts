import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

export interface PickedChatImage {
  uri: string;
  base64: string;
}

async function ensurePermission(source: 'camera' | 'library'): Promise<boolean> {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') return true;
    Alert.alert(
      'Camera permission',
      'Camera access is needed to photograph your crop or field.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => void Linking.openSettings() },
      ],
    );
    return false;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === 'granted') return true;
  Alert.alert(
    'Photo library permission',
    'Photo access is needed to upload a farm image for AI analysis.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Settings', onPress: () => void Linking.openSettings() },
    ],
  );
  return false;
}

async function launchPicker(source: 'camera' | 'library'): Promise<PickedChatImage | null> {
  const allowed = await ensurePermission(source);
  if (!allowed) return null;

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.65,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.65,
          base64: true,
        });

  if (result.canceled || !result.assets[0]?.uri) return null;

  const asset = result.assets[0];
  if (!asset.base64) return null;

  return { uri: asset.uri, base64: asset.base64 };
}

export async function pickChatImage(): Promise<PickedChatImage | null> {
  return new Promise((resolve) => {
    const options = [
      { text: 'Camera', onPress: () => void launchPicker('camera').then(resolve) },
      { text: 'Photo library', onPress: () => void launchPicker('library').then(resolve) },
      { text: 'Cancel', style: 'cancel' as const, onPress: () => resolve(null) },
    ];

    if (Platform.OS === 'ios') {
      Alert.alert('Upload photo', 'Crop, pest, or field photo — AI will analyze it.', options);
    } else {
      Alert.alert('Upload photo', 'Crop, pest, or field photo — AI will analyze it.', options);
    }
  });
}
