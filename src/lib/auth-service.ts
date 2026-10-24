import { BaseCrudService } from '@/integrations';

/**
 * Simple password hashing using SHA-256 (for demo purposes)
 * In production, use bcrypt or similar on the backend
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
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
    // Get all credentials and find matching username
    const result = await BaseCrudService.getAll<any>('credenciales', {}, { limit: 100 });
    const credential = result.items.find((c: any) => c.username?.toLowerCase() === username.toLowerCase());

    if (!credential || !credential.isActive) {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, credential.passwordHash);
    if (!isValid) {
      return null;
    }

    // Update last login date
    try {
      await BaseCrudService.update('credenciales', {
        _id: credential._id,
        lastLoginDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last login date:', error);
    }

    return credential as UserCredentials;
  } catch (error) {
    console.error('Error authenticating user:', error);
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
