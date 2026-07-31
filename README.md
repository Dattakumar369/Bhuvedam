# Bhuvedam

**AI Agriculture Assistant** — Help farmers make better farming decisions using AI and Weather Intelligence.

## Tech Stack

- Expo SDK 54 + React Native
- TypeScript (strict)
- Expo Router
- React Native Paper (Material Design 3)
- Zustand, React Hook Form, Zod, Axios
- Reanimated, Gesture Handler, FlashList, Lottie

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm start
```

## Project Structure

```
app/           # Expo Router screens & navigation
components/    # Reusable UI components
features/      # Feature-specific components
hooks/         # Custom React hooks
services/      # API layer & repositories
store/         # Zustand state stores
theme/         # Design system (colors, typography, spacing)
constants/     # App constants
utils/         # Utility functions
types/         # TypeScript type definitions
providers/     # Context providers
assets/        # Images, fonts, animations
```

## Screens

| Screen | Route |
|--------|-------|
| Splash | `/` |
| Language Selection | `/language` |
| Login | `/login` |
| Home | `/(tabs)` |
| Weather | `/(tabs)/weather` |
| AI Chat | `/(tabs)/ai` |
| Profile | `/(tabs)/profile` |
| Settings | `/settings` |
| About | `/about` |
| Privacy Policy | `/privacy` |
| Terms | `/terms` |
| Crop Guide | `/crop-guide` |

## Backend Integration

Set `EXPO_PUBLIC_API_URL` in `.env` to connect to your NestJS backend. The repository pattern in `services/api/` is ready for real API endpoints.

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run typecheck  # TypeScript check
```
