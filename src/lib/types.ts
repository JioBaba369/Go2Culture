
export type Review = {
  id: string;
  author: {
    name: string;
    avatarImageId: string;
  };
  rating: number;
  comment: string;
  date: string;
};

export type Host = {
  id: string; // hostId
  userId: string;
  name: string; // Denormalized for display
  avatarImageId: string; // Denormalized for display
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
    accessibility: string;
  };
  compliance: {
    foodBusinessRegistered?: boolean;
    councilName?: string;
    foodSafetyTraining?: boolean;
    guidelinesAccepted: boolean;
    foodActClassification?: boolean;
    foodTraderRegistered?: boolean;
    foodBusinessLicense?: boolean;
    foodSafetySupervisor?: boolean;
    foodBusinessNotification?: boolean;
    [key: string]: any;
  };
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
};

export type Experience = {
  id: string; // experienceId
  hostId: string;
  host: Host; // Denormalized for easy access in UI
  title: string;
  category: 'Home-cooked meal' | 'Cultural dinner' | 'Cooking + dining';
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
  reviews: Review[];
  createdAt: string;
};


// A denormalized type for the admin application view
export type HostApplication = {
  id: string;
  hostName: string;
  submittedDate: string;
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
    state: string;
    suburb: string;
    localArea?: string;
    postcode: string;
  };
  
  homeSetup: {
    homeType: string;
    seating: string;
    accessibility?: string;
  };

  experience: {
    title: string;
    description: string;
    duration: string; // Keep as string for mock/display
    category: string;
    
    menu: {
      cuisine: string;
      description: string;
      spiceLevel: 'Mild' | 'Medium' | 'Spicy';
    };

    pricing: {
      pricePerGuest: number;
      maxGuests: number;
    };
    
    photos: {
      mainImageId: string;
    }
  };

  compliance: {
    foodBusinessRegistered?: boolean;
    councilName?: string;
    foodSafetyTrainingCompleted?: boolean;
    guidelinesAccepted: boolean;
    foodActClassification?: boolean;
    foodTraderRegistered?: boolean;
    foodBusinessLicense?: boolean;
    foodSafetySupervisor?: boolean;
    foodBusinessNotification?: boolean;
  };
};
