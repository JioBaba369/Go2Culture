
export type User = {
  id: string;
  role: 'guest' | 'host' | 'both';
  fullName: string;
  email: string;
  phone?: string;
  profilePhotoId?: string; 
  preferences?: {
    cuisines?: string[];
    dietary?: string[];
    priceRange?: { min: number, max: number };
  };
  location?: {
    country: string;
    state?: string;
    suburb?: string;
  }
  status: 'active' | 'suspended' | 'deleted';
  createdAt: any; // Allow ServerTimestamp
  updatedAt: any; // Allow ServerTimestamp
};

export type ComplianceFields = {
  foodBusinessRegistered?: boolean;
  councilName?: string;
  foodSafetyTrainingCompleted?: boolean;
  foodActClassification?: boolean;
  foodTraderRegistered?: boolean;
  foodBusinessLicense?: boolean;
  foodSafetySupervisor?: boolean;
  foodBusinessNotification?: boolean;
  guidelinesAccepted: boolean;
};

export type Host = {
  id: string; // hostId
  userId: string;
  name: string; // Denormalized for display
  profilePhotoId: string; // Denormalized for display
  status: 'draft' | 'under_review' | 'approved' | 'needs_changes' | 'suspended';
  
  profile: {
    bio: string;
    languages: string[];
    culturalBackground: string;
    hostingStyles: string[];
  };

  verification: {
    idVerified: boolean;
    selfieVerified: boolean;
    verifiedAt?: string;
  };

  location: {
    country: string;
    state: string;
    suburb: string;
    localArea?: string;
    postcode: string;
  };

  homeSetup: {
    homeType: string;
    seating: string;
    maxGuests: number;
    pets: boolean;
    smoking: boolean;
    accessibility?: string;
  };
  
  compliance: Partial<ComplianceFields> & { guidelinesAccepted: boolean };

  rating: {
    average: number;
    count: number;
  };

  createdAt: any; // Allow ServerTimestamp
};

// This is a denormalized version for display on the experience page
export type ExperienceReview = {
  id: string;
  author: {
    name:string;
    profilePhotoId: string;
  };
  rating: number;
  comment: string;
  date: string;
};

export type Experience = {
  id: string; // experienceId
  hostId: string;
  userId: string; // The user ID of the host
  title: string;
  category: 'In-Home Dining' | 'Cooking Class' | 'Restaurant Experience' | 'Special Event';
  description: string;
  durationMinutes: number;
  menu: {
    cuisine: string;
    description: string;
    dietary: string[];
    allergens?: string;
    spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  };
  pricing: {
    pricePerGuest: number;
    minGuests?: number;
    maxGuests: number;
  };
  availability: {
    days: string[];
    timeSlots?: string[];
  };
  location: {
    country: string;
    state: string;
    suburb: string;
    localArea?: string;
  };
  photos: {
    mainImageId: string;
    thumbnailImageIds: string[];
  };
  status: 'draft' | 'live' | 'paused';
  rating: {
    average: number;
    count: number;
  };
  createdAt: any; // Allow ServerTimestamp
};


// This represents the Firestore document in /reviews/{reviewId}
export type Review = {
  id: string; // reviewId
  bookingId: string;
  experienceId: string;
  hostId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: any; // Allow ServerTimestamp
};


// A denormalized type for the admin application view
export type HostApplication = {
  id: string;
  userId: string;
  hostName: string;
  submittedDate: any; // Allow ServerTimestamp
  status: 'Pending' | 'Approved' | 'Changes Needed' | 'Rejected';
  riskFlag: 'Low' | 'Medium' | 'High' | null;
  
  profile: {
    photoId: string;
    bio: string;
    languages: string[];
    culturalBackground: string;
    hostingStyles: string[];
  };

  verification: {
    idDocId: string;
    selfieId: string;
    status: 'Verified' | 'Pending' | 'Failed';
  };

  location: {
    country: string;
    state?: string;
    suburb: string;
    localArea?: string;
    postcode: string;
    address?: string;
  };
  
  homeSetup: {
    homeType: string;
    seating: string;
    maxGuests: number;
    pets: boolean;
    smoking: boolean;
    accessibility?: string;
  };

  experience: {
    title: string;
    description: string;
    durationMinutes: number;
    category: string;
    
    menu: {
      cuisine: string;
      description: string;
      spiceLevel: 'Mild' | 'Medium' | 'Spicy';
      allergens?: string;
    };

    pricing: {
      pricePerGuest: number;
      maxGuests: number;
    };
    
    photos: {
      mainImageId: string;
      foodPhotos?: any;
      diningAreaPhoto?: any;
    }
  };

  compliance: Partial<ComplianceFields> & { guidelinesAccepted: boolean, agreeToFoodSafety: boolean };
};

export type Report = {
  id: string;
  targetType: 'Review' | 'Experience' | 'User';
  targetId: string;
  reason: string;
  reportedBy: string;
  reportedUserLink: string | null;
  date: any; // Allow ServerTimestamp
  status: 'Open' | 'In Progress' | 'Resolved';
};
