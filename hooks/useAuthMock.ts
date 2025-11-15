import { useUserStore } from '@/lib/store';

export function useAuthMock() {
  const isAuthenticated = useUserStore(s => s.isAuthenticated);
  const user = useUserStore(s => s.user);
  const login = useUserStore(s => s.login);
  const logout = useUserStore(s => s.logout);

  return { isAuthenticated, user, login, logout };
}
