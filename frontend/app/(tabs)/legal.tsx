import { Redirect } from 'expo-router';

// Redirect to the legal index page
export default function LegalTab() {
  return <Redirect href="/legal" />;
}
