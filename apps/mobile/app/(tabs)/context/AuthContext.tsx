import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../../../lib/api/auth';
import { deleteAccount as deleteAccountApi, fetchMe } from '../../../lib/api/users';
import { getAccessToken, getApiErrorMessage } from '../../../lib/api/client';
import type {
  ApiUser,
  ApiUserRole,
  RegisterPendingResponse,
  ResendVerificationResponse,
  VerifyEmailResponse,
} from '../../../lib/api/types';

export type UserType = {
  id: number;
  name: string;
  role: ApiUserRole;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  username: string | null;
  location: string | null;
  avatarUrl: string | null;
};

interface AuthContextData {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string,
    role?: ApiUserRole
  ) => Promise<RegisterPendingResponse>;
  verifyEmail: (email: string, otp: string) => Promise<VerifyEmailResponse>;
  resendVerificationOtp: (email: string) => Promise<ResendVerificationResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function mapUser(u: ApiUser): UserType {
  return {
    id: u.id,
    name: u.name,
    role: u.role,
    email: u.email,
    emailVerified: u.emailVerified,
    fullName: u.fullName,
    username: u.username,
    location: u.location,
    avatarUrl: u.avatarUrl,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    setUser(mapUser(me));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          await refreshUser();
        }
      } catch {
        await authApi.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { user: apiUser } = await authApi.login(email, password);
    setUser(mapUser(apiUser));
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string,
    role?: ApiUserRole
  ) => {
    return authApi.register(email, password, fullName, role);
  };

  const verifyEmail = async (email: string, otp: string) => {
    const result = await authApi.verifyEmail(email, otp);
    setUser(mapUser(result.user));
    return result;
  };

  const resendVerificationOtp = async (email: string) => {
    return authApi.resendVerificationOtp(email);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const deleteAccount = async (currentPassword: string) => {
    const result = await deleteAccountApi(currentPassword);
    await authApi.logout();
    setUser(null);
    return result.message;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyEmail,
        resendVerificationOtp,
        logout,
        refreshUser,
        deleteAccount,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export { getApiErrorMessage };
