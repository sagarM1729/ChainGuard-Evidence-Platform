/**
 * Navigation Flow Management for Authentication Pages
 * Prevents navigation loops and ensures proper user flow
 */

export const authNavigationFlow = {
  // Main authentication flow
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',

  // Navigation mappings to prevent loops
  getBackRoute: (currentPage: string): string => {
    switch (currentPage) {
      case '/login':
      case '/signup':
        return '/'
      case '/forgot-password':
        return '/login'
      case '/reset-password':
        return '/forgot-password'
      default:
        return '/'
    }
  },

  // Get descriptive back button text
  getBackText: (currentPage: string): string => {
    switch (currentPage) {
      case '/login':
      case '/signup':
        return 'Back to Home'
      case '/forgot-password':
        return 'Back to Login'
      case '/reset-password':
        return 'Back to Forgot Password'
      default:
        return 'Back'
    }
  },

  // Prevent navigation loops by using replace for certain flows
  shouldReplaceHistory: (from: string, to: string): boolean => {
    // Replace history when redirecting after successful actions
    const replaceRoutes = [
      { from: '/signup', to: '/login' },     // After successful signup
      { from: '/reset-password', to: '/login' }, // After successful password reset
      { from: '/login', to: '/dashboard' },  // After successful login
    ]

    return replaceRoutes.some(route => route.from === from && route.to === to)
  }
}
