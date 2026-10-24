import { BaseCrudService } from '@/integrations';
import { hashPassword } from './auth-service';

/**
 * Diagnostic utility to check authentication system status
 */
export async function runAuthDiagnostics(): Promise<{
  credentialsCount: number;
  credentials: any[];
  membersCount: number;
  rolesCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  
  try {
    console.log('=== RUNNING AUTH DIAGNOSTICS ===');
    
    // Check credentials
    console.log('\n[DIAG] Checking credentials collection...');
    const credentialsResult = await BaseCrudService.getAll<any>('credenciales', {}, { limit: 100 });
    const credentials = credentialsResult.items || [];
    console.log(`[DIAG] Found ${credentials.length} credentials`);
    
    if (credentials.length === 0) {
      errors.push('No credentials found in database');
    }
    
    // Log each credential (without passwords)
    credentials.forEach((c: any, idx: number) => {
      console.log(`[DIAG] Credential ${idx + 1}:`);
      console.log(`  - Username: ${c.username}`);
      console.log(`  - Role: ${c.userRole}`);
      console.log(`  - Active: ${c.isActive}`);
      console.log(`  - Member ID: ${c.memberProfileId}`);
      console.log(`  - Hash: ${c.passwordHash?.substring(0, 16)}...`);
    });
    
    // Check members
    console.log('\n[DIAG] Checking members collection...');
    const membersResult = await BaseCrudService.getAll<any>('miembros', {}, { limit: 100 });
    const members = membersResult.items || [];
    console.log(`[DIAG] Found ${members.length} members`);
    
    members.forEach((m: any, idx: number) => {
      console.log(`[DIAG] Member ${idx + 1}: ${m.memberName} (${m.email})`);
    });
    
    // Check roles
    console.log('\n[DIAG] Checking roles collection...');
    const rolesResult = await BaseCrudService.getAll<any>('cargos', {}, { limit: 100 });
    const roles = rolesResult.items || [];
    console.log(`[DIAG] Found ${roles.length} roles`);
    
    roles.forEach((r: any, idx: number) => {
      console.log(`[DIAG] Role ${idx + 1}: ${r.roleName}`);
    });
    
    // Verify password hashing
    console.log('\n[DIAG] Testing password hashing...');
    const testPassword = 'TestPassword123';
    const testHash = await hashPassword(testPassword);
    console.log(`[DIAG] Test password hash: ${testHash.substring(0, 16)}...`);
    
    // Check for required users
    console.log('\n[DIAG] Checking for required users...');
    const requiredUsers = ['IKER', 'CRISTIAN', 'JORDAN', 'IAN'];
    const foundUsers = credentials.map((c: any) => c.username?.toUpperCase()).filter(Boolean);
    
    requiredUsers.forEach(user => {
      if (foundUsers.includes(user)) {
        console.log(`[DIAG] ✓ Found user: ${user}`);
      } else {
        console.log(`[DIAG] ✗ Missing user: ${user}`);
        errors.push(`Missing required user: ${user}`);
      }
    });
    
    console.log('\n=== DIAGNOSTICS COMPLETE ===\n');
    
    return {
      credentialsCount: credentials.length,
      credentials: credentials.map((c: any) => ({
        username: c.username,
        userRole: c.userRole,
        isActive: c.isActive,
        memberProfileId: c.memberProfileId
      })),
      membersCount: members.length,
      rolesCount: roles.length,
      errors
    };
  } catch (error) {
    console.error('[DIAG] Error running diagnostics:', error);
    errors.push(`Diagnostics error: ${error}`);
    return {
      credentialsCount: 0,
      credentials: [],
      membersCount: 0,
      rolesCount: 0,
      errors
    };
  }
}

/**
 * Test authentication with a specific username and password
 */
export async function testAuthentication(username: string, password: string): Promise<{
  success: boolean;
  message: string;
  details: any;
}> {
  try {
    console.log(`\n=== TESTING AUTHENTICATION ===`);
    console.log(`[TEST] Username: ${username}`);
    console.log(`[TEST] Password length: ${password.length}`);
    
    // Get all credentials
    const result = await BaseCrudService.getAll<any>('credenciales', {}, { limit: 100 });
    const credentials = result.items || [];
    
    // Find user
    const normalizedUsername = username.trim().toUpperCase();
    const credential = credentials.find((c: any) => c.username?.trim().toUpperCase() === normalizedUsername);
    
    if (!credential) {
      console.log(`[TEST] User not found: ${normalizedUsername}`);
      return {
        success: false,
        message: `User not found: ${normalizedUsername}`,
        details: { availableUsers: credentials.map((c: any) => c.username) }
      };
    }
    
    console.log(`[TEST] Found credential for: ${credential.username}`);
    
    if (!credential.isActive) {
      console.log(`[TEST] User account is inactive`);
      return {
        success: false,
        message: `User account is inactive`,
        details: { username: credential.username }
      };
    }
    
    // Hash the provided password
    const providedHash = await hashPassword(password);
    console.log(`[TEST] Provided password hash: ${providedHash.substring(0, 16)}...`);
    console.log(`[TEST] Stored password hash:   ${credential.passwordHash.substring(0, 16)}...`);
    
    // Compare
    const isMatch = providedHash === credential.passwordHash;
    console.log(`[TEST] Password match: ${isMatch}`);
    
    if (!isMatch) {
      return {
        success: false,
        message: `Password does not match`,
        details: {
          username: credential.username,
          providedHashStart: providedHash.substring(0, 16),
          storedHashStart: credential.passwordHash.substring(0, 16)
        }
      };
    }
    
    console.log(`[TEST] Authentication successful!`);
    console.log(`=== TEST COMPLETE ===\n`);
    
    return {
      success: true,
      message: `Authentication successful for ${credential.username}`,
      details: {
        username: credential.username,
        userRole: credential.userRole,
        memberProfileId: credential.memberProfileId
      }
    };
  } catch (error) {
    console.error('[TEST] Error testing authentication:', error);
    return {
      success: false,
      message: `Test error: ${error}`,
      details: {}
    };
  }
}
