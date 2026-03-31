import { jwtDecode } from "jwt-decode";

const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const isUsableUser = (user) =>
  Boolean(
    user &&
      typeof user === "object" &&
      user.id &&
      user.role &&
      (user.fullName || user.email),
  );

const parseStoredUser = () => {
  try {
    const rawValue = localStorage.getItem("user");
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    return isUsableUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const decodeTokenUser = () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return null;
    }

    const decoded = jwtDecode(token);
    const normalized = {
      id: decoded?.[NAME_IDENTIFIER_CLAIM] || "",
      email: decoded?.[EMAIL_CLAIM] || "",
      role: decoded?.[ROLE_CLAIM] || "",
      fullName: decoded?.FullName || "",
      avatarUrl: decoded?.AvatarUrl || "",
    };

    return isUsableUser(normalized) ? normalized : null;
  } catch {
    return null;
  }
};

export const getCachedCurrentUser = () => {
  const storedUser = parseStoredUser();
  if (storedUser) {
    return storedUser;
  }

  return decodeTokenUser();
};

export const buildCachedUserResponse = (user) => ({
  data: user,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {},
});
