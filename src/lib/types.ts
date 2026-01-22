export type Host = {
  id: string;
  name: string;
  avatarImageId: string;
  bio: string;
  languages: string[];
  culture: string;
  hostingStyle: string[];
};

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

export type Experience = {
  id: string;
  title: string;
  host: Host;
  location: string;
  city: string;
  country: string;
  category: 'Home-cooked meal' | 'Cultural dinner' | 'Cooking + dining';
  duration: string;
  maxGuests: number;
  pricePerGuest: number;
  mainImageId: string;
  thumbnailImageIds: string[];
  description: string;
  menu: {
    description: string;
    cuisine: string;
    dietary: string[];
    spiceLevel: 'Mild' | 'Medium' | 'Spicy';
  };
  rating: number;
  reviewCount: number;
  reviews: Review[];
  availability: string[];
  houseRules: {
    pets: boolean;
    smoking: boolean;
  };
};

export type HostApplication = {
  id: string;
  hostName: string;
  city: string;
  country: string;
  experienceTitle: string;
  status: 'Pending' | 'Approved' | 'Changes Needed' | 'Rejected';
  submittedDate: string;
  riskFlag: 'Low' | 'Medium' | 'High' | null;
  profile: {
    photoId: string;
    bio: string;
    languages: string[];
    culture: string;
  };
  verification: {
    idDocId: string;
    selfieId: string;
    status: 'Verified' | 'Pending' | 'Failed';
  };
  experience: Omit<Experience, 'id' | 'host' | 'reviews' | 'rating' | 'reviewCount'>;
};
