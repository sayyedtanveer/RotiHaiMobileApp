# RotiHai Mobile App

A partner-first Expo mobile application for the RotiHai food delivery platform. This app enables restaurant partners to manage orders, track deliveries, view earnings, and handle subscriptions.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Architecture](#core-architecture)
- [File Descriptions](#file-descriptions)
- [Technologies & Libraries](#technologies--libraries)
- [Current Status](#current-status)
- [Getting Started](#getting-started)

## Tech Stack

- **Framework:** Expo + React Native + TypeScript
- **Navigation:** React Navigation
- **State Management:** TanStack Query (planned)
- **API Client:** Axios with interceptors
- **Storage:** expo-secure-store for secure session storage
- **WebSocket:** Native WebSocket for real-time updates
- **Notifications:** expo-notifications for push notifications

## Project Structure

```
src/
├── application/              # Business logic & use cases
│   └── partner/
│       ├── auth/             # Partner authentication logic
│       └── orders/           # Order management operations
├── core/                     # Core utilities & infrastructure
│   ├── api/                  # API client & types
│   ├── auth/                 # Authentication & token management
│   ├── config/               # Configuration & environment
│   ├── errors/               # Custom error classes
│   ├── notifications/        # Push notification handling
│   ├── providers/            # React context providers
│   ├── storage/              # Secure storage wrapper
│   └── websocket/            # WebSocket connection manager
└── presentation/             # UI screens & navigation
    └── partner/
        ├── navigation/       # Navigation configuration
        └── screens/          # Partner app screens
```

## Core Architecture

The app follows a **layered architecture** with clear separation of concerns:

### 1. **Presentation Layer** (`/src/presentation`)
Handles all UI components and screens. This layer is responsible for:
- Displaying data to users
- Handling user interactions
- Managing navigation flows
- Contains no business logic

### 2. **Application Layer** (`/src/application`)
Contains business logic and use cases. This layer:
- Orchestrates API calls and data flow
- Handles complex operations like login, order acceptance
- Bridges presentation and core layers
- Keeps screens focused on rendering

### 3. **Core Layer** (`/src/core`)
Infrastructure and cross-cutting concerns:
- **API Client:** Centralized HTTP client with auth interceptors
- **Auth Management:** Session, token, and authentication state
- **WebSocket Manager:** Real-time event handling
- **Storage:** Secure credential storage
- **Configuration:** Environment and app settings

---

## File Descriptions

### Root Level Files

#### `App.tsx`
**Purpose:** Main application entry point and auth gate
- Restores user session on app startup
- Conditionally renders auth screen or app navigator based on authentication state
- Manages WebSocket connection lifecycle tied to auth state
- Shows loading spinner during session restoration

#### `app.json`
**Purpose:** Expo configuration file
- Defines app metadata (name, version, slug)
- Configures platform-specific settings (iOS, Android, Web)
- Sets up adaptive icons for Android
- Defines app styling preferences (light mode)

#### `package.json`
**Purpose:** Node.js project configuration
- Lists all dependencies and versions
- Defines dev scripts (start, android, ios, web)
- Specifies package metadata and entry point

#### `tsconfig.json`
**Purpose:** TypeScript compiler configuration
- Enables strict type checking
- Configures module resolution and output settings

#### `index.ts`
**Purpose:** Main entry file for the application

---

### Core Layer Files

#### **Authentication** (`/src/core/auth`)

##### `AuthManager.ts`
**Purpose:** Central authentication orchestration
- `login(credentials)` - Sends login request, stores session
- `restoreSession()` - Retrieves stored session on app startup
- `logout()` - Clears session and removes stored data
- `refreshToken()` - Refreshes expired access token
- **Key Concept:** Singleton pattern managing auth state

##### `TokenManager.ts`
**Purpose:** Secure token persistence
- `saveSession()` - Stores encrypted session in secure storage
- `getSession()` - Retrieves session from secure storage
- `clearSession()` - Removes session data
- `getAuthorizationHeader()` - Formats auth header for API requests
- **Key Concept:** Uses expo-secure-store for encryption at rest

##### `SessionManager.ts`
**Purpose:** Session lifecycle management
- Handles session expiration and renewal
- Monitors session validity
- Triggers logout on session expiration

##### `auth.types.ts`
**Purpose:** TypeScript type definitions for auth
- `AuthSession` - Session data structure with tokens and user info
- `LoginRequest` - Login credentials structure
- `LoginResponse` - Server response after successful login

#### **API Client** (`/src/core/api`)

##### `ApiClient.ts`
**Purpose:** Centralized HTTP client with interceptors
- Creates axios instance with base URL and timeout
- **Request Interceptor:** Automatically adds Authorization header with token
- **Response Interceptor:** Transforms errors into typed ApiError objects
- Methods: `get()`, `post()`, `put()`, `patch()`
- **Key Concept:** Single point for all API communication

##### `partnerApi.ts`
**Purpose:** Partner-specific API endpoints
- Wraps ApiClient for partner operations
- Provides typed methods for partner routes
- Examples: getOrders(), acceptOrder(), rejectOrder()

##### `partner.types.ts` & `partnerTypes.ts`
**Purpose:** TypeScript interfaces for partner data structures
- Partner profile types
- Order types with status and details
- Request/response shapes for type safety

##### `subscription.types.ts`
**Purpose:** TypeScript interfaces for subscriptions
- Subscription plan structures
- Billing and pricing information

#### **WebSocket Manager** (`/src/core/websocket`)

##### `PartnerWebSocketManager.ts`
**Purpose:** Real-time event connection
- Singleton pattern managing WebSocket lifecycle
- `connect(token)` - Establishes WebSocket connection with auth token
- `disconnect()` - Closes connection gracefully
- `subscribe(listener)` - Registers callback for events
- **Features:**
  - Automatic reconnection with exponential backoff
  - Event parsing and listener notification
  - Manual disconnection prevents auto-reconnect
- **Use Case:** Receive real-time order notifications, status updates

#### **Storage** (`/src/core/storage`)

##### `secureStore.ts`
**Purpose:** Wrapper around expo-secure-store
- Encrypts sensitive data at rest (tokens, sessions)
- Platform-specific: Uses native iOS Keychain and Android Keystore
- Prevents token theft if device is compromised

#### **Configuration** (`/src/core/config`)

##### `env.ts`
**Purpose:** Environment variable management
- Loads API base URL, WebSocket URL from environment
- Provides fallback values for development
- Centralizes all configuration in one place

##### `appConfig.ts`
**Purpose:** App-level configuration
- Feature flags
- API timeouts
- App-wide constants

#### **Error Handling** (`/src/core/errors`)

##### `ApiError.ts`
**Purpose:** Custom error class for API failures
- Extends Error with status codes and error types
- Enables typed error handling in components
- Provides clear error messages to users

#### **Providers** (`/src/core/providers`)

##### `AppProviders.tsx`
**Purpose:** Root context providers wrapper
- Wraps entire app with necessary providers
- Includes React Query, theme providers
- Centralizes provider setup

##### `QueryProvider.tsx`
**Purpose:** TanStack Query (React Query) configuration
- Sets up query client with caching strategy
- Configures retry logic and stale time
- Manages server state across the app

#### **Notifications** (`/src/core/notifications`)

##### `PushNotificationManager.ts`
**Purpose:** Push notification registration and handling
- Registers device with push notification service
- Handles notification received events
- Handles notification tap/interaction events

##### `NotificationHandler.ts`
**Purpose:** Notification logic and routing
- Routes notifications to appropriate screens
- Manages notification permissions
- Parses notification data

---

### Application Layer Files

#### **Partner Orders** (`/src/application/partner/orders`)

These classes implement order management business logic:

##### `GetPartnerOrders.ts`
- `execute()` - Fetches all orders for the logged-in partner
- Returns list of orders with status, items, delivery info
- Used by OrdersScreen to populate order list

##### `AcceptOrder.ts`
- `execute(orderId)` - Accepts a pending order
- Updates order status on server
- Triggers UI update to reflect acceptance

##### `RejectOrder.ts`
- `execute(orderId, reason)` - Rejects an order with optional reason
- Sends rejection reason to backend
- Updates partner's rejection history

##### `UpdateOrderStatus.ts`
- `execute(orderId, status)` - Updates order to new status
- Examples: "preparing", "ready", "on_delivery", "delivered"
- Notifies customer of status change

#### **Partner Auth** (`/src/application/partner/auth`)

##### `LoginPartner.ts`
**Purpose:** Partner login orchestration
- Calls AuthManager.login() with credentials
- Handles login errors gracefully
- Sets up authenticated session
- Triggers WebSocket connection on successful login

---

### Presentation Layer Files

#### **Navigation** (`/src/presentation/partner/navigation`)

##### `PartnerAppNavigator.tsx`
**Purpose:** Main navigation structure for authenticated partners
- Defines tab/stack navigation hierarchy
- Routes to all partner screens
- Manages navigation state and transitions

#### **Screens** (`/src/presentation/partner/screens`)

These components render the UI and handle user interactions:

##### `AuthScreen.tsx`
**Purpose:** Login screen for partners
- Email/password input fields
- Login button that calls LoginPartner use case
- Error message display
- Links to registration/forgot password (if applicable)

##### `HomeScreen.tsx` (PartnerHomeScreen.tsx)
**Purpose:** Dashboard showing partner overview
- Quick stats (pending orders, today's earnings)
- Recent orders list
- Call-to-action buttons for common actions
- Links to detailed screens

##### `OrdersScreen.tsx`
**Purpose:** List of all orders
- Displays orders with status indicators
- Filter/sort options
- Pull-to-refresh to reload orders
- Tap to view order details

##### `OrderDetailScreen.tsx` / `OrdersDetailScreen.tsx`
**Purpose:** Detailed view of a single order
- Full order information (items, customer, address)
- Current status with timeline
- Action buttons (accept, reject, mark ready, etc.)
- Customer contact options

##### `MenuScreen.tsx`
**Purpose:** Restaurant menu management
- View/edit menu items
- Update prices and availability
- Add new items
- Toggle item active status

##### `EarningsScreen.tsx`
**Purpose:** Financial information for partner
- Today's earnings
- Weekly/monthly earnings charts
- Breakdown by order
- Payment history

##### `ProfileScreen.tsx`
**Purpose:** Partner profile information
- Restaurant name and details
- Contact information
- Bank/payment details
- Profile picture

##### `SettingsScreen.tsx`
**Purpose:** App and account settings
- Notification preferences
- Operating hours
- Language/theme selection
- Help and support links

##### `SubscriptionsScreen.tsx`
**Purpose:** Subscription management
- Current subscription plan
- Features included
- Upgrade/downgrade options
- Billing history

##### `PartnerMoreScreen.tsx`
**Purpose:** Additional options menu
- Account settings
- Help & support
- About app
- Logout

---

## Technologies & Libraries

### Core Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `expo` | ~57.0.25 | Cross-platform mobile framework |
| `react-native` | 0.86.3 | Native mobile UI framework |
| `react` | 19.2.3 | UI component library |
| `axios` | Latest | HTTP client for API calls |
| `@react-navigation/native` | Latest | App navigation |
| `expo-status-bar` | ~57.0.1 | Status bar management |
| `expo-secure-store` | Latest | Encrypted storage |
| `expo-notifications` | Latest | Push notifications |

### Dev Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `typescript` | ~6.0.3 | Static type checking |
| `@types/react` | ~19.2.2 | React type definitions |

---

## Current Status

✅ **Completed:**
- App shell with auth gate and session restoration
- Secure session storage with encryption
- Centralized API client with auth interceptors
- Partner-first navigation structure
- WebSocket connection manager for real-time updates
- Placeholder screens for all major features
- TypeScript types for type-safe development

⏳ **In Progress:**
- Backend integration for login and refresh flows
- Order management functionality
- Real-time order notifications via WebSocket

❌ **Planned:**
- Full order details and management screens
- Menu management UI
- Earnings reports and analytics
- Push notification handling
- Payment processing integration
- Subscription management UI

---

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only)
- Android: Android Studio and SDK

### Installation

```bash
# Install dependencies
npm install

# Start the app
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### Build

```bash
# Preview build
expo preview

# Create production build
eas build
```

---

## API Integration Guide

### Making API Calls

The `ApiClient` automatically handles authentication:

```typescript
import { apiClient } from './core/api/ApiClient';

// GET request
const orders = await apiClient.get<Order[]>('/api/partner/orders');

// POST request
const response = await apiClient.post('/api/partner/auth/login', credentials);
```

### WebSocket Events

Subscribe to real-time events:

```typescript
import { PartnerWebSocketManager } from './core/websocket/PartnerWebSocketManager';

const wsManager = PartnerWebSocketManager.getInstance();

const unsubscribe = wsManager.subscribe((event) => {
  console.log('Received event:', event);
});

// Stop listening
unsubscribe();
```

---

## Environment Variables

Create a `.env.local` file:

```
REACT_APP_API_BASE_URL=https://api.rotihaidev.com
REACT_APP_WS_BASE_URL=wss://ws.rotihaidev.com
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## License

See LICENSE file for details.
