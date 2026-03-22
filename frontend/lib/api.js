import axios from "axios";
import { serializePropertyQuery } from "./utils";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storedAuth =
      window.localStorage.getItem("alquiventascr-auth") ||
      window.localStorage.getItem("casa-cr-auth");

    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      const token = parsed?.state?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
});

const unwrap = async (promise) => {
  const response = await promise;
  return response.data;
};

export const apiClient = api;

export const registerUser = (payload) => unwrap(api.post("/auth/register", payload));
export const loginUser = (payload) => unwrap(api.post("/auth/login", payload));
export const logoutUser = () => unwrap(api.post("/auth/logout"));
export const getCurrentUser = () => unwrap(api.get("/auth/me"));
export const updateCurrentUser = (payload) => unwrap(api.patch("/auth/me", payload));
export const requestPasswordReset = (payload) => unwrap(api.post("/auth/forgot-password", payload));

export const getFeaturedProperties = () => unwrap(api.get("/properties/featured"));
export const getProperties = (filters = {}) =>
  unwrap(api.get(`/properties?${serializePropertyQuery(filters)}`));
export const getPropertyBySlug = (slug) => unwrap(api.get(`/properties/slug/${slug}`));
export const getMyProperties = () => unwrap(api.get("/properties/my/listings"));
export const getManageProperty = (propertyId) =>
  unwrap(api.get(`/properties/manage/${propertyId}`));
export const createProperty = (payload) => unwrap(api.post("/properties", payload));
export const updateProperty = (propertyId, payload) =>
  unwrap(api.patch(`/properties/${propertyId}`, payload));
export const updatePropertyStatus = (propertyId, status) =>
  unwrap(api.patch(`/properties/${propertyId}/status`, { status }));
export const updatePropertyFeatured = (propertyId, featured) =>
  unwrap(api.patch(`/properties/${propertyId}/featured`, { featured }));
export const deleteProperty = (propertyId) =>
  unwrap(api.delete(`/properties/${propertyId}`));

export const uploadPropertyImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return unwrap(api.post("/uploads/images", formData));
};

export const getFavorites = () => unwrap(api.get("/favorites"));
export const addFavorite = (propertyId) => unwrap(api.post(`/favorites/${propertyId}`));
export const removeFavorite = (propertyId) => unwrap(api.delete(`/favorites/${propertyId}`));

export const getInteractiveAnalysisOverview = () => unwrap(api.get("/analysis/overview"));
export const compareInteractiveProperties = (propertyIds, language = "es") =>
  unwrap(api.post("/analysis/compare", { propertyIds, language }));
export const askInteractiveAnalysis = (payload) =>
  unwrap(api.post("/analysis/chat", payload));

export const getSavedSearches = () => unwrap(api.get("/saved-searches"));
export const createSavedSearch = (payload) => unwrap(api.post("/saved-searches", payload));
export const updateSavedSearch = (searchId, payload) =>
  unwrap(api.patch(`/saved-searches/${searchId}`, payload));
export const sendSavedSearchAlert = (searchId) =>
  unwrap(api.post(`/saved-searches/${searchId}/send-alert`));
export const deleteSavedSearch = (searchId) =>
  unwrap(api.delete(`/saved-searches/${searchId}`));

export const createLead = (payload) => unwrap(api.post("/leads", payload));
export const getReceivedLeads = (filters = {}) =>
  unwrap(api.get(`/leads/received?${serializePropertyQuery(filters)}`));
export const getSentLeads = (filters = {}) =>
  unwrap(api.get(`/leads/sent?${serializePropertyQuery(filters)}`));
export const updateLead = (leadId, payload) =>
  unwrap(api.patch(`/leads/${leadId}`, payload));
export const updateLeadStatus = (leadId, status) => updateLead(leadId, { status });
export const createOffer = (payload) => unwrap(api.post("/offers", payload));
export const getReceivedOffers = (filters = {}) =>
  unwrap(api.get(`/offers/received?${serializePropertyQuery(filters)}`));
export const getSentOffers = (filters = {}) =>
  unwrap(api.get(`/offers/sent?${serializePropertyQuery(filters)}`));
export const updateOfferStatus = (offerId, status) =>
  unwrap(api.patch(`/offers/${offerId}/status`, { status }));

export const getDashboardSummary = () => unwrap(api.get("/users/dashboard-summary"));
export const getCommercialOverview = () => unwrap(api.get("/users/commercial-overview"));
export const updateMySubscription = (payload) =>
  unwrap(api.patch("/users/subscription", payload));
export const requestUserVerification = (payload) =>
  unwrap(api.post("/users/verification-request", payload));

export const getAdminMetrics = () => unwrap(api.get("/admin/metrics"));
export const getAdminAnalyticsOverview = () =>
  unwrap(api.get("/admin/analytics/overview"));
export const getAdminPropertyIntelligence = (propertyId) =>
  unwrap(api.get(`/admin/analytics/properties/${propertyId}`));
export const getAdminUsers = (filters = {}) =>
  unwrap(api.get(`/admin/users?${serializePropertyQuery(filters)}`));
export const updateAdminUserStatus = (userId, isActive) =>
  unwrap(api.patch(`/admin/users/${userId}/status`, { isActive }));
export const updateAdminUserVerification = (userId, payload) =>
  unwrap(api.patch(`/admin/users/${userId}/verification`, payload));
export const getAdminProperties = (filters = {}) =>
  unwrap(api.get(`/admin/properties?${serializePropertyQuery(filters)}`));
export const moderateAdminProperty = (propertyId, payload) =>
  unwrap(api.patch(`/admin/properties/${propertyId}`, payload));
