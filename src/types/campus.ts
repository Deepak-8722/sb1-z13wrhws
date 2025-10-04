export interface Building {
  id: string;
  name: string;
  code: string;
  category: BuildingCategory;
  description: string;
  hours: string;
  services: string[];
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  image?: string;
}

export enum BuildingCategory {
  Academic = 'academic',
  Dining = 'dining',
  Residential = 'residential',
  Recreation = 'recreation',
  Administrative = 'administrative',
  Library = 'library',
  Parking = 'parking',
  Emergency = 'emergency',
}

export interface CampusService {
  id: string;
  name: string;
  description: string;
  location: string;
  hours: string;
  contact: string;
  emergency?: boolean;
}