import { NativeModules, Platform } from 'react-native';
import { GoogleOneTapUser, GoogleOneTapResult, GoogleOneTapConfig, GoogleOneTapError } from './types';

const { GoogleOneTapModule } = NativeModules;

class GoogleOneTap {
  private _isConfigured = false;

  /**
   * Configure Google One Tap with your web client ID
   */
  async configure(config: GoogleOneTapConfig): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('Google One Tap is only available on Android');
    }

    if (!GoogleOneTapModule) {
      throw new Error('GoogleOneTapModule not found. Make sure you have properly linked the native module.');
    }

    try {
      await GoogleOneTapModule.configure(config.webClientId);
      this._isConfigured = true;
    } catch (error) {
      throw new Error(`Failed to configure Google One Tap: ${error}`);
    }
  }

  /**
   * Initiate Google One Tap sign-in flow
   */
  async signIn(): Promise<GoogleOneTapResult> {
    if (Platform.OS !== 'android') {
      throw new Error('Google One Tap is only available on Android');
    }

    if (!GoogleOneTapModule) {
      throw new Error('GoogleOneTapModule not found. Make sure you have properly linked the native module.');
    }

    if (!this._isConfigured) {
      throw new Error('Google One Tap is not configured. Call configure() first.');
    }

    try {
      const result = await GoogleOneTapModule.signIn();
      return result as GoogleOneTapResult;
    } catch (error: any) {
      throw new Error(`Google One Tap sign-in failed: ${error.message || error}`);
    }
  }

  /**
   * Sign out from Google One Tap
   */
  async signOut(): Promise<void> {
    if (Platform.OS !== 'android') {
      return; // No-op on non-Android platforms
    }

    if (!GoogleOneTapModule) {
      return; // No-op if module not available
    }

    try {
      await GoogleOneTapModule.signOut();
    } catch (error) {
      // Sign out errors are not critical
      console.warn('Google One Tap sign out failed:', error);
    }
  }

  /**
   * Check if Google One Tap is available on this platform
   */
  isAvailable(): boolean {
    return Platform.OS === 'android' && GoogleOneTapModule != null;
  }

  /**
   * Check if Google One Tap is configured
   */
  isConfigured(): boolean {
    return this._isConfigured;
  }
}

export default new GoogleOneTap();
export { GoogleOneTap };
export * from './types';
