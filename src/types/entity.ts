
export interface user_profiles {
  //f24gxm1pktmo
  //Store user profile information with roles
  email: string;
  name: string;
  role: string;
  phone: string;
  created_at: string;
  _uid: string;
  _id: string;
}

export interface buildings {
  //f24gxm1s2pz4
  //Store building information with manager assignments
  name: string;
  address: string;
  total_units: number;
  manager_id: string;
  manager_name: string;
  status: string;
  created_at: string;
  _id: string;
  _uid: string;
}

export interface units {
  // f24gxm1s2pz5
  // Store unit information with resident assignments
  building_id: string;
  building_name: string;
  unit_number: string;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  resident_id: string;
  resident_name: string;
  resident_email: string;
  status: string;
  created_at: string;
  _uid: string;
  _id: string;
}

export interface building_costs {
  // f24hstw6yk1s
  // Tracks all building-related costs and expenses
  building_id: string;
  building_name: string;
  cost_type: string;
  description: string;
  amount: number;
  cost_date: string;
  recorded_by: string;
  recorded_by_name: string;
  notes: string;
  status: string;
  _uid: string;
  _id: string;
}

export interface building_charges {
  // f24hstx8f7k0
  // Defines recurring and one-time charges for buildings
  building_id: string;
  building_name: string;
  charge_type: string;
  amount: number;
  billing_cycle: string;
  effective_date: string;
  description: string;
  is_active: string;
  _id: string;
  _uid: string;
}

export interface bills {
  // f24hstxawxkw
  // Generated bills for units and residents with payment tracking
  unit_id: string;
  unit_number: string;
  building_id: string;
  building_name: string;
  resident_id: string;
  resident_name: string;
  billing_period: string;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  due_date: string;
  issue_date: string;
  payment_date: string;
  charges_breakdown: string;
  notes: string;
  _uid: string;
  _id: string;
}

export interface announcements {
  // f26wla7m4wlc
  // Store announcements with targeting and priority settings
  title: string;
  content: string;
  priority: string;
  target_role: string;
  target_building_id: string;
  status: string;
  created_by: string;
  created_at: string;
  published_at: string;
  _uid: string;
  _id: string;
}

export interface notifications {
  // f26wla7m4wld
  // Store user notifications with read status tracking
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: string;
  created_at: string;
  related_id: string;
  _uid: string;
  _id: string;
}

