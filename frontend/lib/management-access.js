const MANAGEMENT_EMAILS = new Set(["jose17mp@hotmail.com"]);

export const hasManagementAccess = (userOrEmail) => {
  const email = typeof userOrEmail === "string" ? userOrEmail : userOrEmail?.email;

  if (!email) {
    return false;
  }

  return MANAGEMENT_EMAILS.has(String(email).trim().toLowerCase());
};
