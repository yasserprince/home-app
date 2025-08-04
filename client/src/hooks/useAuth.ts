import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Mock authenticated user for mobile icon testing
  const mockUser: User = {
    id: "45796819",
    email: "katiflam1@gmail.com", 
    firstName: "Yasser",
    lastName: "Daddiouameur",
    profileImageUrl: "https://replit.com/public/images/mark.png",
    role: "admin",
    accountType: "seeker",
    wilaya: "Algiers",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    user: mockUser, // Force authenticated user
    isLoading: false,
    isAuthenticated: true,
  };
}
