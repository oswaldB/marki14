/**
 * Script to check for potential console errors on the login page
 * This simulates the browser environment and checks for common issues
 */

console.log('🔍 Checking for potential console errors on login page...\n');

// Simulate the browser environment
const mockWindow = {
  console: {
    error: console.error,
    log: console.log,
    warn: console.warn
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  location: {
    href: '',
    pathname: '/login',
    search: ''
  },
  addEventListener: (event, callback) => {
    if (event === 'DOMContentLoaded') {
      setTimeout(callback, 100);
    }
  }
};

// Mock Parse SDK
global.Parse = {
  User: {
    logIn: async (email, password) => {
      if (!email || !password) {
        throw { code: 200, message: 'Email is required' };
      }
      if (email === 'error@test.com') {
        throw { code: 101, message: 'Invalid email or password' };
      }
      return {
        getSessionToken: () => 'mock-token-123',
        get: (prop) => prop === 'username' ? 'testuser' : null
      };
    },
    become: async (token) => {
      if (token === 'invalid-token') {
        throw { code: 209, message: 'Invalid session token' };
      }
      return {
        getSessionToken: () => token || 'restored-token',
        get: (prop) => prop === 'username' ? 'restoreduser' : null
      };
    }
  },
  initialize: (appId, jsKey) => {
    console.log('✅ Parse SDK initialized');
  },
  serverURL: ''
};

// Mock Alpine
global.Alpine = {
  data: (name, factory) => {
    console.log(`✅ Alpine component registered: ${name}`);
  }
};

// Test scenarios
console.log('🧪 Testing login scenarios...\n');

// Test 1: Empty form submission
console.log('Test 1: Empty form submission');
try {
  const loginState = {
    email: '',
    password: '',
    remember: false,
    isLoading: false,
    error: '',
    
    async handleLogin() {
      this.isLoading = true;
      this.error = '';
      
      if (!this.email || !this.password) {
        throw new Error('Veuillez remplir tous les champs.');
      }
      
      const user = await Parse.User.logIn(this.email, this.password);
      console.log('✅ Login successful');
    },
    
    getErrorMessage(err) {
      if (!err) return 'Une erreur inconnue est survenue.';
      const errorCode = err.code;
      const errorMessages = {
        101: 'Email ou mot de passe incorrect.',
        200: 'L\'email est requis.',
        201: 'Le mot de passe est requis.',
        default: 'Email ou mot de passe incorrect.'
      };
      return errorMessages[errorCode] || errorMessages.default;
    }
  };
  
  await loginState.handleLogin();
} catch (error) {
  console.log(`❌ Expected error: ${error.message}`);
}

// Test 2: Invalid credentials
console.log('\nTest 2: Invalid credentials');
try {
  const loginState = {
    email: 'error@test.com',
    password: 'wrongpassword',
    remember: false,
    isLoading: false,
    error: '',
    
    async handleLogin() {
      this.isLoading = true;
      this.error = '';
      
      if (!this.email || !this.password) {
        throw new Error('Veuillez remplir tous les champs.');
      }
      
      const user = await Parse.User.logIn(this.email, this.password);
      console.log('✅ Login successful');
    },
    
    getErrorMessage(err) {
      if (!err) return 'Une erreur inconnue est survenue.';
      const errorCode = err.code;
      const errorMessages = {
        101: 'Email ou mot de passe incorrect.',
        200: 'L\'email est requis.',
        201: 'Le mot de passe est requis.',
        default: 'Email ou mot de passe incorrect.'
      };
      return errorMessages[errorCode] || errorMessages.default;
    }
  };
  
  await loginState.handleLogin();
} catch (error) {
  console.log(`❌ Expected error: ${error.message}`);
}

// Test 3: Session restoration with invalid token
console.log('\nTest 3: Session restoration with invalid token');
mockWindow.localStorage.getItem = (key) => key === 'parseSessionToken' ? 'invalid-token' : null;

try {
  const sessionToken = mockWindow.localStorage.getItem('parseSessionToken') || mockWindow.sessionStorage.getItem('parseSessionToken');
  
  if (sessionToken) {
    const user = await Parse.User.become(sessionToken);
    console.log('✅ Session restored');
  }
} catch (error) {
  console.log(`❌ Expected error during session restoration: ${error.message}`);
  mockWindow.localStorage.removeItem('parseSessionToken');
  mockWindow.sessionStorage.removeItem('parseSessionToken');
}

// Test 4: Successful login
console.log('\nTest 4: Successful login');
try {
  const loginState = {
    email: 'test@user.com',
    password: 'password',
    remember: true,
    isLoading: false,
    error: '',
    
    async handleLogin() {
      this.isLoading = true;
      this.error = '';
      
      if (!this.email || !this.password) {
        throw new Error('Veuillez remplir tous les champs.');
      }
      
      const user = await Parse.User.logIn(this.email, this.password);
      
      if (this.remember) {
        mockWindow.localStorage.setItem('parseSessionToken', user.getSessionToken());
        console.log('✅ Token saved in localStorage');
      } else {
        mockWindow.sessionStorage.setItem('parseSessionToken', user.getSessionToken());
        console.log('✅ Token saved in sessionStorage');
      }
      
      console.log('✅ Login successful:', user.get('username'));
      
      const urlParams = new URLSearchParams(mockWindow.location.search);
      const redirect = urlParams.get('redirect') || '/dashboard';
      mockWindow.location.href = decodeURIComponent(redirect);
      
      return user;
    }
  };
  
  const user = await loginState.handleLogin();
  console.log('✅ Login completed successfully');
} catch (error) {
  console.log(`❌ Unexpected error: ${error.message}`);
}

console.log('\n📋 Summary of potential console errors:');
console.log('1. ❌ "Veuillez remplir tous les champs." - Empty form submission');
console.log('2. ❌ "Email ou mot de passe incorrect." - Invalid credentials (code 101)');
console.log('3. ❌ "L\'email est requis." - Missing email (code 200)');
console.log('4. ❌ "Le mot de passe est requis." - Missing password (code 201)');
console.log('5. ❌ "Invalid session token" - Invalid token during session restoration');
console.log('6. ❌ "Parse is not defined" - If Parse SDK fails to load');
console.log('7. ❌ "Alpine is not defined" - If Alpine.js fails to load');

console.log('\n💡 Recommendations:');
console.log('1. Ensure Parse SDK is properly loaded before any Parse operations');
console.log('2. Add error boundaries or try-catch blocks around Parse operations');
console.log('3. Validate form inputs before submission');
console.log('4. Handle session token validation gracefully');
console.log('5. Check that all required scripts (Parse, Alpine) are loaded in the correct order');