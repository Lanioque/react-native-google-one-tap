package com.alexniokiz.googleonetap

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class GoogleOneTapModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var serverClientId: String? = null
  private val mainScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

  override fun getName(): String = "GoogleOneTapModule"

  @ReactMethod
  fun configure(webClientId: String, promise: Promise) {
    try {
      serverClientId = webClientId
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("CONFIG_ERROR", e.message)
    }
  }

  @ReactMethod
  fun signIn(promise: Promise) {
    android.util.Log.d("GoogleOneTapModule", "🚀 signIn method called")
    
    val activity: Activity? = getCurrentActivity()
    val clientId = serverClientId
    
    android.util.Log.d("GoogleOneTapModule", "Activity: $activity, ClientId: $clientId")
    
    if (activity == null) {
      android.util.Log.e("GoogleOneTapModule", "❌ No current activity")
      promise.reject("NO_ACTIVITY", "No current activity")
      return
    }
    if (clientId.isNullOrBlank()) {
      android.util.Log.e("GoogleOneTapModule", "❌ Server client ID is not configured")
      promise.reject("CONFIG_ERROR", "Server client ID is not configured")
      return
    }

    mainScope.launch {
      try {
        android.util.Log.d("GoogleOneTapModule", "🔐 Starting credential manager flow")
        
        val credentialManager = CredentialManager.create(activity)

        val googleIdOption = GetGoogleIdOption.Builder()
          .setFilterByAuthorizedAccounts(false)
          .setServerClientId(clientId)
          .setAutoSelectEnabled(false)
          .build()

        val request = GetCredentialRequest.Builder()
          .addCredentialOption(googleIdOption)
          .build()

        android.util.Log.d("GoogleOneTapModule", "📋 Requesting credentials from Google")
        val result: GetCredentialResponse = credentialManager.getCredential(activity, request)
        val credential = result.credential
        val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)

        android.util.Log.d("GoogleOneTapModule", "✅ Credentials received from Google")
        android.util.Log.d("GoogleOneTapModule", "ID Token length: ${googleIdTokenCredential.idToken?.length}")
        android.util.Log.d("GoogleOneTapModule", "User ID: ${googleIdTokenCredential.id}")
        android.util.Log.d("GoogleOneTapModule", "Display Name: ${googleIdTokenCredential.displayName}")

        val map = Arguments.createMap()
        map.putString("idToken", googleIdTokenCredential.idToken)

        val user = Arguments.createMap()
        user.putString("id", googleIdTokenCredential.id ?: "")
        user.putString("email", googleIdTokenCredential.id ?: "")
        user.putString("name", googleIdTokenCredential.displayName ?: "")
        user.putString("givenName", googleIdTokenCredential.givenName ?: "")
        user.putString("familyName", googleIdTokenCredential.familyName ?: "")
        user.putString("photo", googleIdTokenCredential.profilePictureUri?.toString() ?: "")
        map.putMap("user", user)

        android.util.Log.d("GoogleOneTapModule", "✅ Resolving promise with result")
        promise.resolve(map)
      } catch (e: Exception) {
        android.util.Log.e("GoogleOneTapModule", "❌ Error in signIn: ${e.message}", e)
        promise.reject("SIGN_IN_ERROR", e.message)
      }
    }
  }

  @ReactMethod
  fun signOut(promise: Promise) {
    promise.resolve(null)
  }
}
