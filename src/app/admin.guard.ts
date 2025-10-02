import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginGateService } from './login-gate.service';

// Simple admin guard: allows navigation only if user is authenticated AND role === 'admin'
// Otherwise redirect to root (could be enhanced later to open login modal or remember target)
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const gate = inject(LoginGateService);
  if (auth.isAuthenticated() && auth.isAdmin()) return true;
  // Trigger login modal request and stay on current page (do not navigate forward)
  gate.requestLogin(state.url);
  // Navigate to root only if not already there to give user context.
  if (state.url !== '/') router.navigate(['/']);
  return false;
};
