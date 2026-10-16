# RotiHai Mobile App

A partner-first Expo mobile application for RotiHai.

## Tech stack

- Expo + React Native + TypeScript
- React Navigation
- TanStack Query (to be added)
- expo-secure-store for session storage
- expo-notifications for native push support
- axios for typed API access

## Current status

The app foundation has been created with:

- app shell and auth gate
- secure session storage
- centralized API client
- partner-first navigation
- placeholder screens for Home, Orders, Menu, Earnings, and Profile

## Next steps

1. Wire up actual backend login flow and refresh flow
2. Add typed services for orders, products, subscriptions, and profile
3. Add partner dashboard and detail screens
4. Connect WebSocket event invalidation
5. Add native push registration and notification tap handling
