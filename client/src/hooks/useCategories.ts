import { useQuery } from "@tanstack/react-query";

export interface ServiceCategory {
  id: string;
  name: string;
  nameAr?: string | null;
  nameFr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionFr?: string | null;
  icon: string;
  color: string;
  category: string;
  isPopular: boolean;
  sortOrder: number;
  isActive: boolean;
  averagePrice?: string | null;
  estimatedDuration?: string | null;
  skillLevel: string;
  requiresLicense: boolean;
  emergencyService: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export function useCategories() {
  return useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories'],
  });
}

export function usePopularCategories() {
  return useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories/popular'],
  });
}

export function useCategoriesByGroup(group: string) {
  return useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories/by-group', group],
    enabled: !!group,
  });
}