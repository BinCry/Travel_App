import type { UserRole } from "@prisma/client";
import type { ApiUser, ApiUserRole } from "@travel-app/shared/contracts/auth";

export function toFeRole(role: UserRole): ApiUserRole {
  return role === "OWNER" ? "owner" : "traveler";
}

export function toAuthUserDto(u: {
  id: number;
  email: string;
  emailVerifiedAt: Date | null;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  location: string | null;
  role: UserRole;
}): ApiUser {
  return {
    id: u.id,
    email: u.email,
    emailVerified: Boolean(u.emailVerifiedAt),
    fullName: u.fullName,
    username: u.username,
    avatarUrl: u.avatarUrl,
    location: u.location,
    name: u.fullName || u.username || u.email,
    role: toFeRole(u.role),
  };
}
