export {
  createUser,
  createUserProfile,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserByEmailWithPassword,
  getUserById,
  getUserByUsername,
  getUserProfile,
  logUserActivity,
  setUserWriterStatus,
  updateLastLogin,
  updateUser,
  updateUserPassword,
  updateUserProfile,
  updateUserWriterStatus,
} from "./user-service";

export type { UserInterface, UserProfileInterface } from "./user-service";
