import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token was cleared or refreshed
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain access token from Google authentication credential');
    }
    cachedAccessToken = credential.accessToken;
    isSigningIn = false;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    isSigningIn = false;
    console.error('Google Sign-In failed:', error);
    throw error;
  }
};

export const googleSignOut = async (): Promise<void> => {
  cachedAccessToken = null;
  await signOut(auth);
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Uploads an environmental intelligence dossier or evidence bundle directly to Google Drive
 */
export async function uploadToGoogleDrive(
  filename: string,
  mimeType: string,
  content: string | Blob,
  accessToken: string,
  description?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata = {
    name: filename,
    description: description || 'Exported from FORESTGUARD AI Command Center',
    mimeType: mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let body: string;
  if (typeof content === 'string') {
    body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;
  } else {
    // Blob converted to text or uploaded via FormData/ArrayBuffer
    const textContent = await content.text();
    body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      textContent +
      closeDelimiter;
  }

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive upload failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
