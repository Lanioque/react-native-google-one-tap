export interface GoogleOneTapUser {
  id: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  photo: string;
}

export interface GoogleOneTapResult {
  user: GoogleOneTapUser;
  idToken: string;
}

export interface GoogleOneTapConfig {
  webClientId: string;
}

export interface GoogleOneTapError {
  code: string;
  message: string;
}
