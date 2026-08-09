import { useAuth } from "../context/AuthContext";

export default function useRoles() {
  const { user } = useAuth();
  const role = user?.role || null;

  return {
    role,
    isAdmin: () => role === "admin",
    isPI: () => role === "pi" || role === "admin",
    isCoResearcher: () => role === "co_researcher",
    isReviewer: () => role === "reviewer",
    isFunder: () => role === "funder",
    isLegacyResearcher: () => role === "researcher"
  };
}