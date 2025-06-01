
// Mock database service for grievances

export type GrievanceStatus = "open" | "in-progress" | "resolved" | "rejected";

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: string;
  status: GrievanceStatus;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  createdAt: string;
}

// Mock data
let MOCK_GRIEVANCES: Grievance[] = [
  {
    id: "g1",
    title: "Internet Service Disruption",
    description: "My internet service has been down for 3 days and I haven't received any support.",
    category: "Service",
    status: "open",
    userId: "user-1",
    userName: "Regular User",
    createdAt: "2025-05-01T10:30:00Z",
    updatedAt: "2025-05-01T10:30:00Z",
    comments: [
      {
        id: "c1",
        text: "We've received your complaint and are looking into it.",
        userId: "admin-1",
        userName: "Support Team",
        isAdmin: true,
        createdAt: "2025-05-02T09:15:00Z"
      }
    ]
  },
  {
    id: "g2",
    title: "Billing Error on Monthly Statement",
    description: "I was charged twice for my monthly subscription. Please rectify this issue.",
    category: "Billing",
    status: "in-progress",
    userId: "user-1",
    userName: "Regular User",
    createdAt: "2025-05-03T14:22:00Z",
    updatedAt: "2025-05-04T11:45:00Z",
    comments: [
      {
        id: "c2",
        text: "We've identified the duplicate charge and are processing your refund.",
        userId: "admin-1",
        userName: "Billing Department",
        isAdmin: true,
        createdAt: "2025-05-04T11:45:00Z"
      }
    ]
  }
];

// Get all grievances
export const getAllGrievances = () => {
  return [...MOCK_GRIEVANCES];
};

// Get grievances by user
export const getGrievancesByUser = (userId: string) => {
  return MOCK_GRIEVANCES.filter(g => g.userId === userId);
};

// Get grievance by id
export const getGrievanceById = (id: string) => {
  return MOCK_GRIEVANCES.find(g => g.id === id) || null;
};

// Create new grievance
export const createGrievance = (grievance: Omit<Grievance, "id" | "createdAt" | "updatedAt" | "comments">) => {
  const now = new Date().toISOString();
  const newGrievance: Grievance = {
    id: `g${MOCK_GRIEVANCES.length + 1}`,
    ...grievance,
    createdAt: now,
    updatedAt: now,
    comments: []
  };
  
  MOCK_GRIEVANCES = [...MOCK_GRIEVANCES, newGrievance];
  return newGrievance;
};

// Update grievance
export const updateGrievance = (id: string, updates: Partial<Grievance>) => {
  const grievanceIndex = MOCK_GRIEVANCES.findIndex(g => g.id === id);
  
  if (grievanceIndex === -1) {
    return null;
  }
  
  const updatedGrievance = {
    ...MOCK_GRIEVANCES[grievanceIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  MOCK_GRIEVANCES[grievanceIndex] = updatedGrievance;
  return updatedGrievance;
};

// Add comment to grievance
export const addComment = (
  grievanceId: string, 
  text: string, 
  userId: string, 
  userName: string, 
  isAdmin: boolean
) => {
  const grievanceIndex = MOCK_GRIEVANCES.findIndex(g => g.id === grievanceId);
  
  if (grievanceIndex === -1) {
    return null;
  }
  
  const now = new Date().toISOString();
  
  const newComment: Comment = {
    id: `c${Date.now()}`,
    text,
    userId,
    userName,
    isAdmin,
    createdAt: now
  };
  
  const comments = MOCK_GRIEVANCES[grievanceIndex].comments || [];
  const updatedGrievance = {
    ...MOCK_GRIEVANCES[grievanceIndex],
    comments: [...comments, newComment],
    updatedAt: now
  };
  
  MOCK_GRIEVANCES[grievanceIndex] = updatedGrievance;
  return newComment;
};
