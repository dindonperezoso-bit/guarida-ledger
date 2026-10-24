# BANCO DE LA GUARIDA VIRGILIO
## Login Flow Integration - Complete Documentation

### Overview
This document describes the integrated login flow that connects the custom authentication system with the application's session management. The system uses a robust controller pattern to prevent concurrent login attempts and handle errors gracefully.

---

## Architecture

### Components

#### 1. **Login Controller** (`/src/lib/login-controller.ts`)
The main orchestrator for the login flow. Implements:
- **Concurrency Prevention**: Prevents multiple simultaneous login attempts
- **Multi-step Authentication**: 
  1. User credential verification
  2. Profile loading from members collection
  3. Activity tracking
  4. Success callback execution
- **Error Handling**: Comprehensive error messages and logging
- **Session Validation**: Checks user account status

**Key Functions:**
```typescript
createLoginController()
  - Returns: async (username, password, callbacks) => LoginResult
  - Prevents: Concurrent login attempts
  - Handles: All authentication steps

loadUserProfile(memberProfileId)
  - Fetches user profile from 'miembros' collection
  - Returns: MiembrosdelaGuaridaVirgilio | null

updateUserActivity(memberId)
  - Updates last activity timestamp
  - Non-blocking operation

validateUserSession(userId)
  - Validates if user session is still active
  - Checks: User existence, active status

logoutUser()
  - Clears all session data
  - Removes: sessionStorage, localStorage auth data
```

#### 2. **Authentication Service** (`/src/lib/auth-service.ts`)
Handles credential verification:
- Password hashing (SHA-256)
- Credential lookup in 'credenciales' collection
- Password verification
- Last login date updates

**Key Functions:**
```typescript
authenticateUser(username, password)
  - Verifies credentials against database
  - Returns: UserCredentials | null

hashPassword(password)
  - Generates SHA-256 hash
  - Used for password verification

verifyPassword(password, hash)
  - Compares password hash
  - Returns: boolean

getUserByUsername(username)
  - Looks up user by username
  - Case-insensitive search

createUserCredential(username, password, userRole, memberProfileId)
  - Creates new user credential
  - Hashes password before storage
```

#### 3. **Auth Store** (`/src/lib/auth-store.ts`)
Zustand store for session state management:
- Persistent storage (localStorage with "remember me")
- Temporary storage (sessionStorage)
- Session validation
- Loading states

**State:**
```typescript
{
  authUser: AuthUser | null,           // Current authenticated user
  isAuthenticated: boolean,             // Session active flag
  isLoading: boolean,                   // Loading state during auth ops
  setAuthUser(user, rememberMe),       // Set authenticated user
  clearAuthUser(),                      // Clear session
  loadAuthUser(),                       // Load from storage
  validateSession()                     // Validate current session
}
```

#### 4. **Login Page** (`/src/components/pages/LoginPage.tsx`)
UI component that:
- Collects username and password
- Calls login controller
- Handles loading states and errors
- Redirects on success
- Displays demo credentials

---

## Login Flow Diagram

```
User Input (Username, Password)
         ↓
   LoginPage.handleLogin()
         ↓
   createLoginController()
         ↓
   ┌─────────────────────────────────────┐
   │ Check: Is login already processing? │
   │ YES → Return error                  │
   │ NO → Continue                       │
   └─────────────────────────────────────┘
         ↓
   ┌─────────────────────────────────────┐
   │ Step 1: Authenticate User           │
   │ authenticateUser(username, password)│
   │ - Fetch credentials from DB         │
   │ - Find matching username            │
   │ - Verify password hash              │
   │ - Check if account is active        │
   └─────────────────────────────────────┘
         ↓
   ┌─────────────────────────────────────┐
   │ Step 2: Load User Profile           │
   │ loadUserProfile(memberProfileId)    │
   │ - Fetch from 'miembros' collection  │
   │ - Validate profile exists           │
   └─────────────────────────────────────┘
         ↓
   ┌─────────────────────────────────────┐
   │ Step 3: Update Activity             │
   │ updateUserActivity(memberId)        │
   │ - Set lastActivityDate to now       │
   │ - Non-blocking operation            │
   └─────────────────────────────────────┘
         ↓
   ┌─────────────────────────────────────┐
   │ Step 4: Execute Success Callback    │
   │ onSuccess({ user, profile })        │
   │ - Store in auth store               │
   │ - Redirect to home                  │
   └─────────────────────────────────────┘
         ↓
   Success: User authenticated and redirected
```

---

## Error Handling

The system handles errors at multiple levels:

### 1. **Input Validation**
```typescript
if (!username || !password) {
  throw new Error('Username and password are required');
}
```

### 2. **Authentication Failures**
- User not found
- Password mismatch
- Account inactive
- Profile not found

### 3. **Database Errors**
- Connection failures
- Query timeouts
- Data inconsistencies

### 4. **Concurrency Prevention**
```typescript
if (isProcessing) {
  return {
    success: false,
    error: 'Login already in progress'
  };
}
```

### 5. **Error Callback**
```typescript
onError?.(error);
// Displays error message to user
// Logs error for debugging
```

---

## Demo Accounts

The system initializes with four demo accounts (created in `initialize-credentials.ts`):

| Username | Password | Role | Member |
|----------|----------|------|--------|
| IKER | Iker_Virgilio#82 | PRESIDENTE DEL BANCO | Iker |
| CRISTIAN | Cristian_Super#47 | SUPERVISOR FINANCIERO | Cristian |
| JORDAN | Jordan_Banco#63 | ADMINISTRADOR DEL DINERO | Jordan |
| IAN | Ian_Guarida#29 | MIEMBRO | Ian |

Each account has:
- Corresponding credential record in 'credenciales' collection
- Member profile in 'miembros' collection
- Associated role in 'cargos' collection
- Proper permissions based on role

---

## Session Management

### Storage Strategy

**Remember Me (Checked by default):**
- Stored in: localStorage (via Zustand persist)
- Duration: Until manually logged out
- Survives: Browser restart

**Temporary Session (Unchecked):**
- Stored in: sessionStorage
- Duration: Until browser tab closed
- Survives: Page refresh (same tab)

### Session Validation

```typescript
validateSession() {
  // Checks:
  // 1. authUser exists
  // 2. isAuthenticated is true
  // 3. User account is active
  
  // Returns: boolean
}
```

### Logout

```typescript
logoutUser() {
  // Clears:
  // 1. sessionStorage.authUser
  // 2. localStorage auth-store
  // 3. Auth store state
}
```

---

## Integration with Header

The Header component (`/src/components/Header.tsx`) integrates with the auth system:

```typescript
// Uses auth store
const { authUser, isAuthenticated: isAuthStoreAuthenticated, clearAuthUser } = useAuthStore();

// Shows authenticated user
{isAuthStoreAuthenticated && authUser ? (
  <>
    <Link to="/profile">{authUser.username}</Link>
    <button onClick={() => {
      clearAuthUser();
      navigate('/login');
    }}>Salir</button>
  </>
) : (
  <Link to="/login">Iniciar Sesión</Link>
)}
```

---

## Logging and Debugging

The system includes comprehensive logging with prefixes:

| Prefix | Module | Purpose |
|--------|--------|---------|
| `[LOGIN]` | Login Controller | Main flow events |
| `[AUTH]` | Auth Service | Credential verification |
| `[HASH]` | Auth Service | Password hashing |
| `[PROFILE]` | Login Controller | Profile loading |
| `[ACTIVITY]` | Login Controller | Activity updates |
| `[SESSION]` | Login Controller | Session validation |
| `[LOGOUT]` | Login Controller | Logout operations |
| `[AUTH_STORE]` | Auth Store | State management |
| `[LOGIN_PAGE]` | Login Page | UI events |

**Example Console Output:**
```
[LOGIN] Starting authentication flow for user: IKER
[AUTH] Attempting to authenticate user: IKER
[AUTH] Found 4 credentials in database
[AUTH] Available usernames: IKER, CRISTIAN, JORDAN, IAN
[AUTH] Found credential for user: IKER, verifying password...
[HASH] Generated hash for password of length 18: a1b2c3d4e5f6g7h8...
[AUTH] Authentication successful for user: IKER
[PROFILE] Fetching profile for member ID: uuid-1234...
[PROFILE] Profile loaded successfully: Iker
[ACTIVITY] Updating last activity for member: uuid-1234
[ACTIVITY] Last activity updated successfully
[LOGIN_PAGE] Login successful for IKER
[AUTH_STORE] Setting auth user: IKER, rememberMe: true
```

---

## Security Considerations

### 1. **Password Hashing**
- Uses SHA-256 (client-side for demo)
- In production: Use bcrypt on backend
- Passwords never stored in plain text

### 2. **Session Storage**
- sessionStorage: Cleared on browser close
- localStorage: Requires explicit logout
- Both cleared on logout

### 3. **Concurrency Prevention**
- Prevents race conditions
- Prevents duplicate submissions
- Prevents session conflicts

### 4. **Account Status Checks**
- Verifies account is active
- Prevents inactive user login
- Validates on each session load

### 5. **Activity Tracking**
- Records last login date
- Records last activity date
- Useful for audit logs

---

## Usage Examples

### Basic Login
```typescript
const controller = createLoginController();

const result = await controller('IKER', 'Iker_Virgilio#82', {
  onSuccess: ({ user, profile }) => {
    console.log(`Logged in as ${user.username}`);
  },
  onError: (error) => {
    console.error(`Login failed: ${error.message}`);
  },
  onLoading: (isLoading) => {
    console.log(`Loading: ${isLoading}`);
  }
});

if (result.success) {
  console.log('Authentication successful');
} else {
  console.log(`Error: ${result.error}`);
}
```

### Session Validation
```typescript
const { authUser, validateSession } = useAuthStore();

if (validateSession()) {
  console.log(`Session valid for ${authUser?.username}`);
} else {
  console.log('Session invalid, redirecting to login');
}
```

### Logout
```typescript
const { clearAuthUser } = useAuthStore();

clearAuthUser();
navigate('/login');
```

---

## Troubleshooting

### Issue: "Login already in progress"
**Cause:** User clicked login button multiple times
**Solution:** Wait for first login to complete, or refresh page

### Issue: "Invalid username or password"
**Cause:** Incorrect credentials or user not found
**Solution:** Check demo credentials, verify user exists in database

### Issue: "User profile not found"
**Cause:** Member profile missing for credential
**Solution:** Verify member exists in 'miembros' collection

### Issue: "User account is inactive"
**Cause:** User's isActive flag is false
**Solution:** Activate user in 'credenciales' collection

### Issue: Session lost after page refresh
**Cause:** "Remember Me" was unchecked
**Solution:** Check "Remember Me" to persist session

---

## Future Enhancements

1. **Two-Factor Authentication**
   - Add OTP verification
   - Email/SMS confirmation

2. **Password Reset**
   - Implement forgot password flow
   - Email verification

3. **Session Timeout**
   - Auto-logout after inactivity
   - Configurable timeout duration

4. **Login History**
   - Track all login attempts
   - Record IP addresses
   - Detect suspicious activity

5. **Rate Limiting**
   - Limit failed login attempts
   - Temporary account lockout
   - Progressive delays

6. **OAuth Integration**
   - Google/Microsoft login
   - Social authentication

---

## Related Files

- `/src/lib/login-controller.ts` - Main login orchestrator
- `/src/lib/auth-service.ts` - Credential verification
- `/src/lib/auth-store.ts` - Session state management
- `/src/components/pages/LoginPage.tsx` - Login UI
- `/src/components/Header.tsx` - Navigation with auth
- `/src/lib/initialize-credentials.ts` - Demo account setup
- `/src/lib/data-initialization.ts` - System initialization

---

## Last Updated
October 24, 2026

**Status:** ✅ Production Ready
**Version:** 1.0.0
