import { useAuth as useAuthContext } from "../Contexts/AuthContext";

export default function useAuth() {
  return useAuthContext();
}