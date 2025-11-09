
interface House1 {
  buildingId: number;
  name: string;
  address: string;
  totalUnits: number;
  managerId?: string;  
  // status: 'active' | 'inactive' | 'under_construction';
  createdAt: string;
}

export { House1 };

// export interface ApiResponse {
//   houses1: House1[];
// }

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

export interface ApiResponse {
  users: User[];
}