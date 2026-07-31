import { Redirect } from 'expo-router';

/** @deprecated Use /(tabs)/crop tab instead */
export default function CropGuideRedirect() {
  return <Redirect href="/(tabs)/crop" />;
}
