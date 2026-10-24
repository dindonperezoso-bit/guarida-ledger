import { BaseCrudService } from '@/integrations';

/**
 * Simple password hashing using SHA-256 (for demo purposes)
 * In production, use bcrypt or similar on the backend
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password) {
      throw new Error('Password cannot be empty');
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log(`[HASH] Generated hash for password of length ${password.length}: ${hashHex.substring(0, 16)}...`);
    
    return hashHex;
  } catch (error) {
    console.error('[HASH] Error hashing password:', error);
    throw error;
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (!password || !hash) {
      console.error('[AUTH] Password or hash is empty');
      return false;
    }
    
    const passwordHash = await hashPassword(password);
    const isMatch = passwordHash === hash;
    
    if (!isMatch) {
      console.error('[AUTH] Password hash mismatch');
      console.log(`[AUTH] Expected: ${hash.substring(0, 16)}...`);
      console.log(`[AUTH] Got:      ${passwordHash.substring(0, 16)}...`);
    }
    
    return isMatch;
  } catch (error) {
    console.error('[AUTH] Error verifying password:', error);
    return false;
  }
}

/**
 * User credentials interface
 */
export interface UserCredentials {
  _id: string;
  username: string;
  passwordHash: string;
  userRole: string;
  memberProfileId: string;
  isActive: boolean;
  lastLoginDate?: Date | string;
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(username: string, password: string): Promise<UserCredentials | null> {
  try {
    if (!username || !password) {
      console.error('Username or password is empty');
      return null;
    }

    // Normalize input: trim and convert to uppercase for consistency
    const normalizedUsername = username.trim().toUpperCase();
    
    console.log(`[AUTH] Attempting to authenticate user: ${normalizedUsername}`);

    // Get all credentials and find matching username
    const result = await BaseCrudService.getAll<any>('credenciales', {}, { limit: 100 });
    
    if (!result || !result.items) {
      console.error('[AUTH] Failed to fetch credentials from database');
      return null;
    }

    console.log(`[AUTH] Found ${result.items.length} credentials in database`);
    
    // Log all usernames for debugging
    const allUsernames = result.items.map((c: any) => c.username).filter(Boolean);
    console.log(`[AUTH] Available usernames: ${allUsernames.join(', ')}`);

    // Find credential with case-insensitive comparison
    const credential = result.items.find((c: any) => {
      const storedUsername = c.username?.trim().toUpperCase();
      return storedUsername === normalizedUsername;
    });

    if (!credential) {
      console.error(`[AUTH] User not found: ${normalizedUsername}`);
      return null;
    }

    if (!credential.isActive) {
      console.error(`[AUTH] User account is inactive: ${normalizedUsername}`);
      return null;
    }

    console.log(`[AUTH] Found credential for user: ${credential.username}, verifying password...`);

    // Verify password
    const isValid = await verifyPassword(password, credential.passwordHash);
    if (!isValid) {
      console.error(`[AUTH] Password verification failed for user: ${normalizedUsername}`);
      return null;
    }

    console.log(`[AUTH] Authentication successful for user: ${normalizedUsername}`);

    // Update last login date (non-blocking)
    BaseCrudService.update('credenciales', {
      _id: credential._id,
      lastLoginDate: new Date().toISOString()
    }).catch(error => {
      console.error('Error updating last login date:', error);
    });

    return credential as UserCredentials;
  } catch (error) {
    console.error('[AUTH] Error authenticating user:', error);
    return null;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<UserCredentials | null> {
  try {
    const result = await BaseCrudService.getAll<any>('credenciales', {}, { limit: 100 });
    const credential = result.items.find((c: any) => c.username?.toLowerCase() === username.toLowerCase());
    return credential || null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

/**
 * Create new user credential
 */
export async function createUserCredential(
  username: string,
  password: string,
  userRole: string,
  memberProfileId: string
): Promise<UserCredentials> {
  const passwordHash = await hashPassword(password);
  
  const credential: UserCredentials = {
    _id: crypto.randomUUID(),
    username,
    passwordHash,
    userRole,
    memberProfileId,
    isActive: true
  };

  await BaseCrudService.create('credenciales', credential);
  return credential;
}
