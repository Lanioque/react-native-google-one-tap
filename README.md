# React Native Google One Tap

A React Native library for Google One Tap Sign-In on Android using the native Android Credential Manager API.

## Features

- ✅ Native Android implementation using Credential Manager API
- ✅ TypeScript support with full type definitions
- ✅ Simple and intuitive API
- ✅ Follows Google's latest One Tap guidelines
- ✅ No external dependencies beyond React Native
- ✅ Lightweight and performant

## Installation

```bash
npm install react-native-google-one-tap
# or
yarn add react-native-google-one-tap
```

## Android Setup

### 1. Dependencies (Auto-Injected) ✨

**Good news!** Dependencies are automatically injected when you install the package. The following dependencies will be added to your `android/app/build.gradle` automatically:

```gradle
dependencies {
    // Auto-injected by react-native-google-one-tap
    implementation 'androidx.credentials:credentials:1.3.0'
    implementation 'androidx.credentials:credentials-play-services-auth:1.3.0'
    implementation 'com.google.android.libraries.identity.googleid:googleid:1.1.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0'
}
```

**Manual Setup (if auto-injection fails):**

If the automatic dependency injection doesn't work, you can manually add the dependencies above to your `android/app/build.gradle` or run:

```bash
npx react-native-google-one-tap-setup
```

### 2. Auto-linking

The library supports React Native auto-linking. After installation, run:

```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

If auto-linking doesn't work, you can manually link by adding the package to your `MainApplication.java`:

```java
import com.alexniokiz.googleonetap.GoogleOneTapPackage;

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new GoogleOneTapPackage() // Add this line
    );
}
```

### 3. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Name: Your app name
   - Authorized redirect URIs: `https://your-domain.com/auth/callback`
5. Copy the **Web client ID** (not the Android client ID)

## Usage

### Basic Setup

```typescript
import { GoogleOneTap } from 'react-native-google-one-tap';

// Configure with your web client ID from Google Cloud Console
await GoogleOneTap.configure({
  webClientId: 'your-web-client-id.apps.googleusercontent.com'
});
```

### Sign In

```typescript
import { GoogleOneTap } from 'react-native-google-one-tap';

const handleSignIn = async () => {
  try {
    const result = await GoogleOneTap.signIn();
    
    console.log('User:', result.user);
    console.log('ID Token:', result.idToken);
    
    // Use the ID token for authentication
    // Send it to your backend or use with Supabase, Firebase, etc.
  } catch (error) {
    console.error('Sign in failed:', error);
  }
};
```

### Complete Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { GoogleOneTap, GoogleOneTapResult } from 'react-native-google-one-tap';

const App = () => {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    initializeGoogleOneTap();
  }, []);

  const initializeGoogleOneTap = async () => {
    try {
      if (GoogleOneTap.isAvailable()) {
        await GoogleOneTap.configure({
          webClientId: 'your-web-client-id.apps.googleusercontent.com'
        });
        setIsConfigured(true);
      }
    } catch (error) {
      console.error('Failed to configure Google One Tap:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      const result: GoogleOneTapResult = await GoogleOneTap.signIn();
      
      Alert.alert(
        'Success',
        `Welcome ${result.user.name}!`
      );
      
      // Handle successful authentication
      // You can now use result.idToken for your authentication flow
      
    } catch (error) {
      Alert.alert('Error', 'Sign in failed');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Google One Tap Demo</Text>
      
      {GoogleOneTap.isAvailable() && isConfigured ? (
        <TouchableOpacity onPress={handleSignIn}>
          <Text>Sign in with Google</Text>
        </TouchableOpacity>
      ) : (
        <Text>Google One Tap not available</Text>
      )}
    </View>
  );
};

export default App;
```

### Integration with Supabase

```typescript
import { GoogleOneTap } from 'react-native-google-one-tap';
import { supabase } from './supabaseClient';

const signInWithGoogle = async () => {
  try {
    // Get Google One Tap result
    const googleResult = await GoogleOneTap.signIn();
    
    // Sign in to Supabase with the ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: googleResult.idToken,
      options: {
        data: {
          first_name: googleResult.user.givenName,
          last_name: googleResult.user.familyName,
          full_name: googleResult.user.name,
          avatar_url: googleResult.user.photo,
          email: googleResult.user.email,
        }
      }
    });

    if (error) throw error;
    
    console.log('Supabase sign in successful:', data);
  } catch (error) {
    console.error('Authentication failed:', error);
  }
};
```

## API Reference

### GoogleOneTap

#### Methods

##### `configure(config: GoogleOneTapConfig): Promise<void>`

Configures Google One Tap with your web client ID.

**Parameters:**
- `config.webClientId` (string): Your web client ID from Google Cloud Console

**Returns:** Promise that resolves when configuration is complete

##### `signIn(): Promise<GoogleOneTapResult>`

Initiates the Google One Tap sign-in flow.

**Returns:** Promise that resolves with user data and ID token

##### `signOut(): Promise<void>`

Signs out from Google One Tap.

**Returns:** Promise that resolves when sign out is complete

##### `isAvailable(): boolean`

Checks if Google One Tap is available on the current platform.

**Returns:** `true` if available, `false` otherwise

##### `isConfigured(): boolean`

Checks if Google One Tap has been configured.

**Returns:** `true` if configured, `false` otherwise

### Types

#### `GoogleOneTapConfig`

```typescript
interface GoogleOneTapConfig {
  webClientId: string;
}
```

#### `GoogleOneTapResult`

```typescript
interface GoogleOneTapResult {
  user: GoogleOneTapUser;
  idToken: string;
}
```

#### `GoogleOneTapUser`

```typescript
interface GoogleOneTapUser {
  id: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  photo: string;
}
```

## Requirements

- React Native 0.60+
- Android API level 21+ (Android 5.0)
- Google Play Services
- Kotlin support

## Troubleshooting

### Common Issues

1. **"GoogleOneTapModule not found"**
   - Make sure you've run `npx react-native run-android` after installation
   - Check that auto-linking is working or manually link the package

2. **"No credentials available"**
   - Make sure you have a Google account signed in on your device
   - Verify your web client ID is correct

3. **Build errors**
   - Make sure all required dependencies are added to `android/app/build.gradle`
   - Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`

### Debug Logs

The library includes extensive debug logging. Check your Android logs:

```bash
adb logcat | grep GoogleOneTapModule
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues, please file an issue on GitHub.
