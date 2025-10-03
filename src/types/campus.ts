export interface Building {
  id: string;
  name: string;
  code: string;
  category: BuildingCategory;
  description: string;
  hours: string;
  services: string[];
  coordinates: { x: number; y: number };
  phone?: string;
  email?: string;
  image?: string;
}

export type BuildingCategory = 
  | 'academic' 
  | 'dining' 
  | 'residential' 
  | 'recreation' 
  | 'administrative' 
  | 'library' 
  | 'parking' 
  | 'emergency';

export interface CampusService {
  id: string;
  name: string;
  description: string;
  location: string;
  hours: string;
  contact: string;
  emergency?: boolean;
}