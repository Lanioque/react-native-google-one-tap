import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { GoogleOneTap, GoogleOneTapResult } from '../src';

const App = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<GoogleOneTapResult['user'] | null>(null);

  useEffect(() => {
    initializeGoogleOneTap();
  }, []);

  const initializeGoogleOneTap = async () => {
    try {
      if (GoogleOneTap.isAvailable()) {
        // Replace with your actual web client ID
        await GoogleOneTap.configure({
          webClientId: 'your-web-client-id.apps.googleusercontent.com'
        });
        setIsConfigured(true);
        console.log('✅ Google One Tap configured successfully');
      } else {
        console.log('❌ Google One Tap not available on this platform');
      }
    } catch (error) {
      console.error('❌ Failed to configure Google One Tap:', error);
      Alert.alert('Configuration Error', 'Failed to configure Google One Tap');
    }
  };

  const handleSignIn = async () => {
    if (!isConfigured) {
      Alert.alert('Error', 'Google One Tap is not configured');
      return;
    }

    setIsLoading(true);
    try {
      const result: GoogleOneTapResult = await GoogleOneTap.signIn();
      
      setUser(result.user);
      
      Alert.alert(
        'Success! 🎉',
        `Welcome ${result.user.name}!\n\nEmail: ${result.user.email}\nID Token length: ${result.idToken.length}`
      );
      
      console.log('✅ Sign in successful:', {
        user: result.user,
        idTokenLength: result.idToken.length
      });
      
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      Alert.alert('Sign In Failed', error.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleOneTap.signOut();
      setUser(null);
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Google One Tap Demo</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Platform:</Text>
          <Text style={[styles.statusValue, GoogleOneTap.isAvailable() ? styles.success : styles.error]}>
            {GoogleOneTap.isAvailable() ? 'Android ✅' : 'Not Available ❌'}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Configured:</Text>
          <Text style={[styles.statusValue, isConfigured ? styles.success : styles.error]}>
            {isConfigured ? 'Yes ✅' : 'No ❌'}
          </Text>
        </View>

        {user && (
          <View style={styles.userContainer}>
            <Text style={styles.userTitle}>Signed In User:</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!user ? (
            <TouchableOpacity
              style={[styles.button, styles.signInButton, (!isConfigured || isLoading) && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={!isConfigured || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing In...' : 'Sign in with Google One Tap'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
            >
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Setup Instructions:</Text>
          <Text style={styles.infoText}>
            1. Get your web client ID from Google Cloud Console{'\n'}
            2. Replace 'your-web-client-id' in the code{'\n'}
            3. Add required dependencies to android/app/build.gradle{'\n'}
            4. Make sure you have a Google account signed in on your device
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#1a1a1a',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  success: {
    color: '#28a745',
  },
  error: {
    color: '#dc3545',
  },
  userContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    marginVertical: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButton: {
    backgroundColor: '#4285f4',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1976d2',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1976d2',
  },
});

export default App;
