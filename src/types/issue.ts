export type IssueStatus = 'submitted' | 'in-progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'pothole' | 'streetlight' | 'trash' | 'traffic' | 'sidewalk' | 'parking' | 'noise' | 'vandalism' | 'water' | 'other';

export interface Issue {
  _id: string;
  _uid: string;
  _tid: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  imageUrl?: string;
  voiceNoteUrl?: string;
  voiceTranscription?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
  updatedAt: number;
  // Voting fields
  voteCount?: number;
  communityPriority?: number;
  userVote?: 'upvote' | 'downvote' | null;
  // Admin fields
  assignedDepartment?: string;
  assignedTo?: string;
  adminNotes?: string;
}

export type VoteType = 'upvote' | 'downvote';

export interface IssueVote {
  _id: string;
  _uid: string;
  _tid: string;
  issue_id: string;
  user_id: string;
  vote_type: VoteType;
  created_at: number;
}

export const ISSUE_CATEGORIES = [
  { value: 'pothole', label: 'Potholes & Road Damage' },
  { value: 'streetlight', label: 'Street Lighting' },
  { value: 'trash', label: 'Trash & Litter' },
  { value: 'traffic', label: 'Traffic Signals' },
  { value: 'sidewalk', label: 'Sidewalk Issues' },
  { value: 'parking', label: 'Parking Problems' },
  { value: 'noise', label: 'Noise Complaints' },
  { value: 'vandalism', label: 'Vandalism & Graffiti' },
  { value: 'water', label: 'Water & Drainage' },
  { value: 'other', label: 'Other' }
];

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low - Minor inconvenience' },
  { value: 'medium', label: 'Medium - Needs attention' },
  { value: 'high', label: 'High - Safety concern' },
  { value: 'critical', label: 'Critical - Immediate danger' }
];

// Priority scoring configuration
export const CATEGORY_PRIORITY_WEIGHTS = {
  'traffic': 90,        // Traffic signals - high safety impact
  'pothole': 80,        // Road damage - safety and vehicle damage
  'streetlight': 70,    // Street lighting - safety concern
  'water': 60,          // Water/drainage - infrastructure
  'sidewalk': 50,       // Sidewalk issues - accessibility 
  'vandalism': 40,      // Vandalism - community impact
  'parking': 30,        // Parking - convenience
  'trash': 25,          // Trash - aesthetics and health
  'noise': 20,          // Noise - quality of life
  'other': 10           // Other - case by case
} as const;

// High-traffic/priority location types for scoring boost
export const HIGH_PRIORITY_LOCATION_KEYWORDS = [
  'school', 'hospital', 'emergency', 'main', 'downtown', 'center', 'plaza',
  'park', 'bridge', 'intersection', 'highway', 'route', 'avenue', 'boulevard'
];

// Function to calculate automatic priority based on category and location
export function calculateIssuePriority(
  category: IssueCategory, 
  address?: string,
  description?: string
): IssuePriority {
  let score = CATEGORY_PRIORITY_WEIGHTS[category] || 10;
  
  // Location-based scoring boost
  if (address) {
    const addressLower = address.toLowerCase();
    const locationBoost = HIGH_PRIORITY_LOCATION_KEYWORDS.some(keyword => 
      addressLower.includes(keyword)
    ) ? 20 : 0;
    score += locationBoost;
  }
  
  // Description-based urgency keywords
  if (description) {
    const descLower = description.toLowerCase();
    const urgencyKeywords = ['urgent', 'emergency', 'dangerous', 'broken', 'blocked', 'flooding'];
    const safetyKeywords = ['accident', 'injury', 'unsafe', 'hazard', 'risk'];
    
    if (urgencyKeywords.some(keyword => descLower.includes(keyword))) {
      score += 25;
    }
    if (safetyKeywords.some(keyword => descLower.includes(keyword))) {
      score += 30;
    }
  }
  
  // Convert score to priority level
  if (score >= 100) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
