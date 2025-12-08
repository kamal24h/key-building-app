
interface House1 {
  buildingId: number;
  name: string;
  address: string;
  totalUnits: number;
  managerId?: string;  
  status: 'active' | 'inactive' | 'under_construction';
  createdAt: string;
}

export { House1 };

// export interface ApiResponse {
//   houses1: House1[];
// }


export interface Resident {
  residentId: number;
  residentGuid: string;
  name: string;
  family: string;
  userName: string;
  password: string;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  family: string;
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