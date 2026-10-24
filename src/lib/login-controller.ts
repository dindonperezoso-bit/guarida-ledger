/**
 * BANCO DE LA GUARIDA VIRGILIO
 * Login Controller - Handles authentication flow with Wix integration
 * 
 * This controller manages:
 * 1. User authentication via custom credentials system
 * 2. Profile loading from member database
 * 3. Session persistence and state management
 * 4. Error handling and loading states
 * 5. Prevention of concurrent login attempts
 */

import { authenticateUser, UserCredentials } from './auth-service';
import { BaseCrudService } from '@/integrations';
import { MiembrosdelaGuaridaVirgilio } from '@/entities';

export interface LoginCallbacks {
  onSuccess?: (data: { user: UserCredentials; profile: MiembrosdelaGuaridaVirgilio }) => Promise<void>;
  onError?: (error: Error) => void;
  onLoading?: (isLoading: boolean) => void;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: UserCredentials;
  profile?: MiembrosdelaGuaridaVirgilio;
}

/**
 * Create a login controller with built-in concurrency prevention
 */
export function createLoginController() {
  let isProcessing = false;

  return async function handleLogin(
    username: string,
    password: string,
    callbacks: LoginCallbacks = {}
  ): Promise<LoginResult> {
    const { onSuccess, onError, onLoading } = callbacks;

    // Prevent concurrent login attempts
    if (isProcessing) {
      console.warn('[LOGIN] Login already in progress, ignoring duplicate request');
      return {
        success: false,
        error: 'Login already in progress'
      };
    }

    isProcessing = true;
    onLoading?.(true);

    try {
      // Validate inputs
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      console.log(`[LOGIN] Starting authentication flow for user: ${username}`);

      // Step 1: Authenticate with the custom credentials system
      console.log('[LOGIN] Step 1: Authenticating user credentials...');
      const user = await authenticateUser(username, password);

      if (!user) {
        throw new Error('Invalid username or password');
      }

      console.log(`[LOGIN] Step 1 Complete: User authenticated - ${user.username}`);

      // Step 2: Load user profile from members collection
      console.log('[LOGIN] Step 2: Loading user profile...');
      const profile = await loadUserProfile(user.memberProfileId);

      if (!profile) {
        throw new Error('User profile not found');
      }

      console.log(`[LOGIN] Step 2 Complete: Profile loaded - ${profile.memberName}`);

      // Step 3: Update last activity date
      console.log('[LOGIN] Step 3: Updating user activity...');
      await updateUserActivity(profile._id);

      console.log('[LOGIN] Step 3 Complete: Activity updated');

      // Step 4: Call success callback
      console.log('[LOGIN] Step 4: Executing success callback...');
      await onSuccess?.({ user, profile });

      console.log('[LOGIN] Authentication flow completed successfully');

      return {
        success: true,
        user,
        profile
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[LOGIN] Authentication failed:', errorMessage);
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      isProcessing = false;
      onLoading?.(false);
    }
  };
}

/**
 * Load user profile from members collection
 */
async function loadUserProfile(memberProfileId: string): Promise<MiembrosdelaGuaridaVirgilio | null> {
  try {
    if (!memberProfileId) {
      console.error('[PROFILE] Member profile ID is empty');
      return null;
    }

    console.log(`[PROFILE] Fetching profile for member ID: ${memberProfileId}`);

    const profile = await BaseCrudService.getById<MiembrosdelaGuaridaVirgilio>(
      'miembros',
      memberProfileId
    );

    if (!profile) {
      console.error(`[PROFILE] Profile not found for member ID: ${memberProfileId}`);
      return null;
    }

    console.log(`[PROFILE] Profile loaded successfully: ${profile.memberName}`);
    return profile;

  } catch (error) {
    console.error('[PROFILE] Error loading user profile:', error);
    return null;
  }
}

/**
 * Update user's last activity date
 */
async function updateUserActivity(memberId: string): Promise<void> {
  try {
    if (!memberId) {
      console.warn('[ACTIVITY] Member ID is empty, skipping activity update');
      return;
    }

    console.log(`[ACTIVITY] Updating last activity for member: ${memberId}`);

    await BaseCrudService.update('miembros', {
      _id: memberId,
      lastActivityDate: new Date().toISOString()
    });

    console.log('[ACTIVITY] Last activity updated successfully');

  } catch (error) {
    console.error('[ACTIVITY] Error updating user activity:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Validate user session (check if user is still active)
 */
export async function validateUserSession(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      console.warn('[SESSION] User ID is empty');
      return false;
    }

    console.log(`[SESSION] Validating session for user: ${userId}`);

    const credential = await BaseCrudService.getById<any>('credenciales', userId);

    if (!credential) {
      console.warn('[SESSION] Credential not found');
      return false;
    }

    if (!credential.isActive) {
      console.warn('[SESSION] User account is inactive');
      return false;
    }

    console.log('[SESSION] Session validation successful');
    return true;

  } catch (error) {
    console.error('[SESSION] Error validating session:', error);
    return false;
  }
}

/**
 * Logout user (clear session data)
 */
export async function logoutUser(): Promise<void> {
  try {
    console.log('[LOGOUT] Clearing user session...');
    
    // Clear session storage
    sessionStorage.removeItem('authUser');
    
    // Clear localStorage auth data
    localStorage.removeItem('auth-store');
    
    console.log('[LOGOUT] User session cleared successfully');
  } catch (error) {
    console.error('[LOGOUT] Error during logout:', error);
    // Don't throw - allow logout to complete even if cleanup fails
  }
}
