// Global type declarations for window extensions and other global types
declare global {
  interface Window {
    /**
     * Fallback auth store when the main auth state fails to load
     */
    authStoreFallback: {
      checkAuth: (redirect: boolean, pathname: string) => Promise<boolean>;
    };
    
    /**
     * Login state factory function
     */
    loginState: () => {
      username: string;
      password: string;
      rememberMe: boolean;
      loading: boolean;
      error: string | null;
      handleLogin: () => void;
    };
    
    /**
     * Alpine.js global object
     */
    Alpine: any;
    
    /**
     * Alpine.js stores collection
     */
    alpineStores: Record<string, any>;
    
    /**
     * Parse REST API configuration
     */
    PARSE_AUTH_CONFIG: {
      appId: string;
      restApiKey: string;
      serverUrl: string;
      masterKey: string | null;
    };
    
    /**
     * Parse REST API utilities
     */
    ParseRest: {
      becomeSession: (sessionToken: string) => Promise<{
        user: any;
        sessionToken: string;
      }>;
    };
    
    /**
     * Authentication value fallback
     */
    withAuthValue: boolean;
  }
  
  /**
   * Extended EventTarget interface to include src property
   */
  interface EventTarget {
    src?: string;
  }
  
  /**
   * Extended Event interface to include detail property for custom events
   */
  interface Event {
    detail?: any;
  }
}

export {};