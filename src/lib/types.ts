


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
  bio?: string;
  profession?: string;
  birthDate?: string;
  languages?: string[];
  brandName?: string;
  preferences?: {
    cuisines?: string[];
    dietary?: string[];
    guiltyPleasures?: string;
    priceRange?: { min: number, max: number };
  };
  location?: {
    country: string;
    region?: string;
    suburb?: string;
    city?: string;
  }
  status: 'active' | 'suspended' | 'deleted';
  suspensionReason?: string;
  createdAt: any; // Allow ServerTimestamp
  updatedAt: any; // Allow ServerTimestamp
  termsAccepted?: boolean;
  referralCode?: string;
  referralCredit?: number;
  referredBy?: string;
  deletedAt?: any; // Allow ServerTimestamp
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
  insurancePolicyAccepted?: boolean; 
  hasPublicLiabilityInsurance?: boolean;
  understandsFoodRegulations?: boolean;
  acceptsIndependentHostStatus?: boolean;
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
  billingCountry?: string; // Two-letter ISO country code

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
  status: 'draft' | 'live' | 'paused' | 'archived';
  instantBook?: boolean;
  rating: {
    average: number;
    count: number;
  };
  createdAt: any; // Allow ServerTimestamp
  updatedAt?: any;
  deletedAt?: any; // For soft deletes
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
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  cancellationReason?: string;
  rescheduleRequest?: {
    requestedBy: string;
    newDate: any; // Allow ServerTimestamp
    status: 'pending' | 'accepted' | 'declined';
    createdAt: any; // Allow ServerTimestamp
  };
  createdAt: any; // Allow ServerTimestamp
  couponId?: string;
  discountAmount?: number;
  isGift?: boolean;
  payment: {
    intentId: string;
    status: 'requires_payment' | 'paid' | 'refunded' | 'released';
    paidAt?: any;
    releasedAt?: any;
  };
  pricing: {
    basePrice: number;
    guests: number;
    serviceFee: number;
    total: number;
    currency: string;
  };
  policySnapshot: {
    cancellationPolicy: string;
    refundWindowHours: number;
    hostIsIndependent: boolean;
    platformIsMarketplace: boolean;
    guestAcceptedAt: any;
  };
};

export type WishlistItem = {
  id: string;
  createdAt: any;
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
  id: string; // Same as bookingId
  bookingId: string;
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
  lastMessage?: {
    text: string;
    timestamp: any;
    senderId: string;
  };
  readBy: { [key: string]: any }; // Map of userId to timestamp
  createdAt: any;
  updatedAt?: any;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: any; // Allow ServerTimestamp
};

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
  };

  compliance: Partial<ComplianceFields> & { guidelinesAccepted: boolean, agreeToFoodSafety?: boolean };
};

export type Report = {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  bookingId?: string;
  experienceId?: string;
  targetType: 'Review' | 'Experience' | 'User';
  targetId: string;
  reason: 'safety' | 'fraud' | 'harassment' | 'food_hygiene' | 'other';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Dismissed';
  createdAt: any;
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

export type AuditLog = {
    id: string;
    actorId: string;
    actorRole: 'guest' | 'host' | 'both' | 'admin' | 'system';
    action: string;
    targetType: 'user' | 'booking' | 'experience' | 'application' | 'review' | 'conversation' | 'message';
    targetId: string;
    metadata?: Record<string, any>;
    createdAt: any; // Allow ServerTimestamp
}

    