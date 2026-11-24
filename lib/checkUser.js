import { getCurrentUser } from "./auth";

/**
 * Syncs the current session user with our database
 * Backward-compatible with previous checkUser() usage
 */
export const checkUser = async () => {
  return await getCurrentUser();
};
