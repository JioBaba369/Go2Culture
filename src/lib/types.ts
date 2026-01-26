
export type User = {
  id: string;
  role: 'guest' | 'host' | 'both';
  fullName: string;
  email: string;
  phone?: string;
  website?: string;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  profilePhotoId?: string;
  languages?: string[];
  brandName?: string;
  preferences?: {
    cuisines?: string[];
    dietary?: string[];
    priceRange?: { min: number, max: number };
  };
  location?: {
    country: string;
    region?: string;
    suburb?: string;
    city?: string;
  }
  status: 'active' | 'suspended' | 'deleted';
  createdAt: any; // Allow ServerTimestamp
  updatedAt: any; // Allow ServerTimestamp
  termsAccepted?: boolean;
  referralCode?: string;
  referralCredit?: number;
  referredBy?: string;
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
  contractAccepted?: boolean;
  responsibilitiesAccepted?: boolean;
  insurancePolicyAccepted?: boolean;
  agreeToFoodSafety?: boolean;
};

export type Host = {
  id: string; // hostId
  userId: string;
  name: string; // Denormalized for display
  level?: 'Superhost';
  profilePhotoId: string; // Denormalized for display
  status: 'draft' | 'under_review' | 'approved' | 'needs_changes' | 'suspended';
  
  profile: {
    bio: string;
    culturalBackground: string;
    hostingStyles: string[];
    achievements?: string[];
  };

  verification: {
    idVerified: boolean;
    selfieVerified: boolean;
    verifiedAt?: string;
  };

  location: {
    country: string;
    region?: string;
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
    familyFriendly?: boolean;
    elevator?: boolean;
    airConditioning?: boolean;
    taxiNearby?: boolean;
    publicTransportNearby?: boolean;
    wifi?: boolean;
  };
  
  compliance: Partial<ComplianceFields> & { guidelinesAccepted: boolean };

  rating: {
    average: number;
    count: number;
  };
  
  blockedDates?: string[]; // yyyy-MM-dd format

  createdAt: any; // Allow ServerTimestamp
};

// This is a denormalized type for display on the experience page
export type ExperienceReview = {
  id: string;
  author: {
    name:string;
    profilePhotoURL: string;
  };
  rating: number;
  comment: string;
  date: string;
};

export type Experience = {
  id: string; // experienceId
  hostId: string;
  userId: string; // The user ID of the host
  hostName: string; // Denormalized host name
  hostProfilePhotoId: string; // Denormalized host photo
  title: string;
  category: 'In-Home Dining' | 'Cooking Class' | 'Restaurant Experience' | 'Special Event' | 'Art & Craft' | 'Music & Dance' | 'History & Walks';
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
    region?: string;
    suburb: string;
    localArea?: string;
  };
  photos: {
    mainImageId: string;
    thumbnailImageIds?: string[];
  };
  inclusions?: string[];
  whatToBring?: string[];
  status: 'draft' | 'live' | 'paused';
  instantBook?: boolean;
  rating: {
    average: number;
    count: number;
  };
  createdAt: any; // Allow ServerTimestamp
  updatedAt?: any;
};


// This represents the Firestore document in /reviews/{reviewId}
export type Review = {
  id: string; // reviewId
  bookingId: string;
  experienceId: string;
  hostId: string;
  guestId: string; // Changed from userId
  rating: number;
  comment: string;
  createdAt: any; // Allow ServerTimestamp
};

export type Booking = {
  id: string;
  guestId: string;
  experienceId: string;
  experienceTitle: string;
  hostId: string;
  hostName: string;
  bookingDate: any; // Allow ServerTimestamp
  numberOfGuests: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  cancellationReason?: string;
  createdAt: any; // Allow ServerTimestamp
  couponId?: string;
  discountAmount?: number;
  isGift?: boolean;
};

export type WishlistItem = {
  // The document ID is the experienceId. This type represents the data within the document.
  createdAt: any; // Allow ServerTimestamp
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId: string;
  messageText: string;
  timestamp: any; // Allow ServerTimestamp
  participants: string[];
};

export type Conversation = {
  id: string; // This will be the bookingId
  participants: string[];
  participantInfo: {
    [key: string]: {
      fullName: string;
      profilePhotoId: string;
    }
  };
  bookingInfo: {
    experienceTitle: string;
    experienceId: string;
  };
  lastMessage: {
    text: string;
    timestamp: any;
    senderId: string;
  };
  readBy: string[];
};


// A denormalized type for the admin application view
export type HostApplication = {
  id: string;
  userId: string;
  hostName: string;
  submittedDate: any; // Allow ServerTimestamp
  status: 'Pending' | 'Approved' | 'Changes Needed' | 'Rejected';
  riskFlag: 'Low' | 'Medium' | 'High' | null;
  experienceId?: string;
  
  profile: {
    profilePhotoId: string;
    bio: string;
    hostingStyles: string[];
    expertise: string;
    hostingExperienceLevel: 'professional' | 'passionate';
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tripadvisor?: string;
      other?: string;
    };
    // Kept for data consistency even if not in the form
    languages?: string;
    culturalBackground?: string;
    availabilityPreference?: 'weekdays' | 'weekends' | 'not-sure';
  };

  verification: {
    idDocId: string;
    selfieId: string;
    status: 'Verified' | 'Pending' | 'Failed';
  };

  location: {
    country: string;
    region?: string;
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
    familyFriendly?: boolean;
    elevator?: boolean;
    airConditioning?: boolean;
    taxiNearby?: boolean;
    publicTransportNearby?: boolean;
    wifi?: boolean;
    wowFactors?: string[];
    spaceDescription?: string;
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
    }
  };

  compliance: Partial<ComplianceFields> & { guidelinesAccepted: boolean, agreeToFoodSafety?: boolean };
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

export type Coupon = {
  id: string; // The code itself
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt?: any; // Allow ServerTimestamp
  isActive: boolean;
  minSpend?: number;
  usageLimit?: number;
  timesUsed: number;
};

export type Sponsor = {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  isActive: boolean;
  createdAt: any;
};
