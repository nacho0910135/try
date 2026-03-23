"use client";

const COMMERCIAL_ROLES = new Set(["agent", "owner", "admin"]);

export const hasCommercialDashboardAccess = (userOrRole) => {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  return COMMERCIAL_ROLES.has(role);
};

export const getAuthenticatedHomePath = (userOrRole) =>
  hasCommercialDashboardAccess(userOrRole) ? "/dashboard" : "/favorites";

export const getRoleRestrictedFallbackPath = (userOrRole) =>
  hasCommercialDashboardAccess(userOrRole) ? "/dashboard" : "/favorites";
