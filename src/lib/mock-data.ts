
import type { Host, Review, Experience, HostApplication, User, ExperienceReview, Report } from '@/lib/types';

export const mockUsers: User[] = [
  {
    id: 'user-1', role: 'host', fullName: 'Maria', email: 'maria@go2culture.com', status: 'active',
    createdAt: '2023-01-10T09:00:00Z', updatedAt: '2023-01-10T09:00:00Z', profilePhotoId: 'host-1'
  },
  {
    id: 'user-2', role: 'host', fullName: 'Kenji', email: 'kenji@go2culture.com', status: 'active',
    createdAt: '2023-02-15T09:00:00Z', updatedAt: '2023-02-15T09:00:00Z', profilePhotoId: 'host-2'
  },
  {
    id: 'user-3', role: 'host', fullName: 'Priya', email: 'priya@go2culture.com', status: 'active',
    createdAt: '2023-03-20T09:00:00Z', updatedAt: '2023-03-20T09:00:00Z', profilePhotoId: 'host-3'
  },
  {
    id: 'user-4', role: 'host', fullName: 'Javier', email: 'javier@go2culture.com', status: 'active',
    createdAt: '2023-04-01T09:00:00Z', updatedAt: '2023-04-01T09:00:00Z', profilePhotoId: 'host-4'
  },
  {
    id: 'user-5', role: 'guest', fullName: 'Sophie', email: 'sophie@guest.com', status: 'active',
    createdAt: '2023-10-01T12:00:00Z', updatedAt: '2023-10-01T12:00:00Z', profilePhotoId: 'guest-1'
  },
  {
    id: 'user-6', role: 'guest', fullName: 'David', email: 'david@guest.com', status: 'suspended',
    createdAt: '2023-10-02T14:00:00Z', updatedAt: '2023-11-01T10:00:00Z', profilePhotoId: 'guest-2'
  },
  {
    id: 'user-7', role: 'both', fullName: 'Chloe', email: 'chloe@go2culture.com', status: 'active',
    createdAt: '2023-05-18T11:00:00Z', updatedAt: '2023-05-18T11:00:00Z', profilePhotoId: 'host-3'
  },
  {
    id: 'user-8', role: 'guest', fullName: 'Ben', email: 'ben@guest.com', status: 'active',
    createdAt: '2023-09-05T18:00:00Z', updatedAt: '2023-09-05T18:00:00Z', profilePhotoId: 'guest-3'
  },
  {
    id: 'user-9', role: 'host', fullName: 'Anya', email: 'anya@go2culture.com', status: 'active',
    createdAt: '2023-05-01T09:00:00Z', updatedAt: '2023-05-01T09:00:00Z', profilePhotoId: 'host-5'
  },
  {
    id: 'user-10', role: 'host', fullName: 'Antoine', email: 'antoine@go2culture.com', status: 'active',
    createdAt: '2023-05-02T09:00:00Z', updatedAt: '2023-05-02T09:00:00Z', profilePhotoId: 'host-6'
  },
  {
    id: 'user-11', role: 'host', fullName: 'Hemi', email: 'hemi@go2culture.com', status: 'active',
    createdAt: '2023-05-03T09:00:00Z', updatedAt: '2023-05-03T09:00:00Z', profilePhotoId: 'host-7'
  },
  {
    id: 'user-12', role: 'host', fullName: 'Linh', email: 'linh@go2culture.com', status: 'active',
    createdAt: '2023-05-04T09:00:00Z', updatedAt: '2023-05-04T09:00:00Z', profilePhotoId: 'host-8'
  },
  {
    id: 'user-13', role: 'host', fullName: 'Fatima', email: 'fatima@go2culture.com', status: 'active',
    createdAt: '2023-06-01T09:00:00Z', updatedAt: '2023-06-01T09:00:00Z', profilePhotoId: 'host-9'
  },
  {
    id: 'user-14', role: 'host', fullName: 'Liam', email: 'liam@go2culture.com', status: 'active',
    createdAt: '2023-06-02T09:00:00Z', updatedAt: '2023-06-02T09:00:00Z', profilePhotoId: 'host-10'
  },
];

export const mockHosts: Host[] = [
  {
    id: 'host-1', userId: 'user-1', name: 'Maria', profilePhotoId: 'host-1', status: 'approved',
    profile: {
      bio: 'Passionate Italian home cook from Carlton, sharing my grandmother\'s recipes. I love opera, fresh pasta, and good conversation.',
      languages: ['Italian', 'English'], culturalBackground: 'Italian', hostingStyles: ['Family-style', 'Storytelling'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-01-10T10:00:00Z' },
    location: { country: 'AU', region: 'VIC', suburb: 'MEL', localArea: 'CARLTON', postcode: '3053' },
    homeSetup: { homeType: 'House', seating: 'Table', maxGuests: 6, pets: true, smoking: false, accessibility: 'Two steps to enter' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.9, count: 134 }, createdAt: '2023-01-10T09:00:00Z',
  },
  {
    id: 'host-2', userId: 'user-2', name: 'Kenji', profilePhotoId: 'host-2', status: 'approved',
    profile: {
      bio: 'I am a designer and a foodie from Sydney. Join me for a quiet, traditional meal where we can appreciate the beauty of simplicity in Japanese cuisine.',
      languages: ['Japanese', 'English'], culturalBackground: 'Japanese', hostingStyles: ['Quiet & traditional'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-02-15T10:00:00Z' },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'SURRY', postcode: '2010' },
    homeSetup: { homeType: 'Apartment', seating: 'Table', maxGuests: 4, pets: false, smoking: false, accessibility: 'Elevator access' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.9, count: 72 }, createdAt: '2023-02-15T09:00:00Z',
  },
  {
    id: 'host-3', userId: 'user-3', name: 'Priya', profilePhotoId: 'host-3', status: 'approved',
    profile: {
      bio: 'My family and I love to host in Harris Park! We fill our home with the aromas of North Indian spices and the sounds of laughter. Come as a guest, leave as family.',
      languages: ['Hindi', 'English'], culturalBackground: 'North Indian', hostingStyles: ['Festive & social', 'Family-style'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-03-20T10:00:00Z' },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'HARRISPARK', postcode: '2150' },
    homeSetup: { homeType: 'House', seating: 'Mixed', maxGuests: 8, pets: false, smoking: false, accessibility: 'Ground floor' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.85, count: 150 }, createdAt: '2023-03-20T09:00:00Z',
  },
  {
    id: 'host-4', userId: 'user-4', name: 'Javier', profilePhotoId: 'host-4', status: 'approved',
    profile: {
      bio: 'From Oaxaca with love, now in Fitzroy. I bring the vibrant street food culture of Mexico to my home. Expect bold flavors, lots of color, and great stories.',
      languages: ['Spanish', 'English'], culturalBackground: 'Mexican', hostingStyles: ['Festive & social', 'Storytelling'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-04-01T10:00:00Z' },
    location: { country: 'AU', region: 'VIC', suburb: 'MEL', localArea: 'FITZROY', postcode: '3065' },
    homeSetup: { homeType: 'Apartment', seating: 'Table', maxGuests: 8, pets: false, smoking: true, accessibility: 'Ramp available' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.8, count: 98 }, createdAt: '2023-04-01T09:00:00Z',
  },
  {
    id: 'host-5', userId: 'user-9', name: 'Anya', profilePhotoId: 'host-5', status: 'approved',
    profile: {
      bio: 'Let me transport you to Thailand with a home-cooked meal full of fragrant herbs and spices. I learned to cook from my mother in Bangkok.',
      languages: ['Thai', 'English'], culturalBackground: 'Thai', hostingStyles: ['Family-style', 'Festive & social'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-05-01T10:00:00Z' },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'NEWTOWN', postcode: '2042' },
    homeSetup: { homeType: 'House', seating: 'Table', maxGuests: 6, pets: false, smoking: false, accessibility: 'Two steps to enter' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.9, count: 45 }, createdAt: '2023-05-01T09:00:00Z',
  },
  {
    id: 'host-6', userId: 'user-10', name: 'Antoine', profilePhotoId: 'host-6', status: 'approved',
    profile: {
      bio: 'Experience a taste of a Parisian bistro in my cozy apartment in Surry Hills. I focus on classic French techniques and high-quality, local ingredients.',
      languages: ['French', 'English'], culturalBackground: 'French', hostingStyles: ['Quiet & traditional', 'Storytelling'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-05-02T10:00:00Z' },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'SURRY', postcode: '2010' },
    homeSetup: { homeType: 'Apartment', seating: 'Table', maxGuests: 4, pets: true, smoking: false, accessibility: 'Elevator available' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.8, count: 32 }, createdAt: '2023-05-02T09:00:00Z',
  },
  {
    id: 'host-7', userId: 'user-11', name: 'Hemi', profilePhotoId: 'host-7', status: 'approved',
    profile: {
      bio: 'Kia ora! Join my whānau (family) for an authentic Hāngi experience. Learn about our Māori culture, the preparation of the earth oven, and share in a tradition passed down through generations.',
      languages: ['English', 'Te Reo Māori'], culturalBackground: 'Māori', hostingStyles: ['Family-style', 'Storytelling'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-05-03T10:00:00Z' },
    location: { country: 'NZ', region: 'AUK', suburb: 'AKL', localArea: 'PONSONBY', postcode: '1011' },
    homeSetup: { homeType: 'House', seating: 'Mixed', maxGuests: 10, pets: true, smoking: false, accessibility: 'Outdoor event with some uneven ground.' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.95, count: 88 }, createdAt: '2023-05-03T09:00:00Z',
  },
  {
    id: 'host-8', userId: 'user-12', name: 'Linh', profilePhotoId: 'host-8', status: 'approved',
    profile: {
      bio: 'Taste the delicate balance of flavors in authentic Vietnamese home cooking in Wellington. I make a legendary Pho that has been in my family for generations.',
      languages: ['Vietnamese', 'English'], culturalBackground: 'Vietnamese', hostingStyles: ['Family-style', 'Quiet & traditional'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-05-04T10:00:00Z' },
    location: { country: 'NZ', region: 'WGN', suburb: 'WLG', localArea: 'TEARO', postcode: '6011' },
    homeSetup: { homeType: 'Apartment', seating: 'Table', maxGuests: 5, pets: false, smoking: false, accessibility: 'None' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.9, count: 55 }, createdAt: '2023-05-04T09:00:00Z',
  },
  {
    id: 'host-9', userId: 'user-13', name: 'Fatima', profilePhotoId: 'host-9', status: 'approved',
    profile: {
      bio: 'From Beirut to Brisbane, I bring the taste of Lebanon. Join me for a mezze feast you won\'t forget!',
      languages: ['Arabic', 'English'], culturalBackground: 'Lebanese', hostingStyles: ['Festive & social'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-06-01T10:00:00Z' },
    location: { country: 'AU', region: 'QLD', suburb: 'BRI', localArea: 'WESTEND', postcode: '4101' },
    homeSetup: { homeType: 'House', seating: 'Table', maxGuests: 8, pets: false, smoking: false, accessibility: 'Ramp available' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.9, count: 62 }, createdAt: '2023-06-01T09:00:00Z',
  },
  {
    id: 'host-10', userId: 'user-14', name: 'Liam', profilePhotoId: 'host-10', status: 'approved',
    profile: {
      bio: 'Explore the fresh seafood of Western Australia with a modern Australian twist. I source my ingredients from the local Fremantle markets.',
      languages: ['English'], culturalBackground: 'Australian', hostingStyles: ['Storytelling'],
    },
    verification: { idVerified: true, selfieVerified: true, verifiedAt: '2023-06-02T10:00:00Z' },
    location: { country: 'AU', region: 'WA', suburb: 'PER', localArea: 'FREMANTLE', postcode: '6160' },
    homeSetup: { homeType: 'Apartment', seating: 'Table', maxGuests: 6, pets: false, smoking: false, accessibility: 'Elevator access' },
    compliance: { guidelinesAccepted: true }, rating: { average: 4.8, count: 41 }, createdAt: '2023-06-02T09:00:00Z',
  },
];

export const mockReviews: Review[] = [
  {
    id: 'review-1', bookingId: 'booking-1', experienceId: '1', hostId: 'host-1', guestId: 'user-5', rating: 5,
    comment: 'An absolutely unforgettable evening! Maria\'s pasta was the best I\'ve ever had, and her stories made the experience so special. Felt like dinner with family.',
    createdAt: '2023-10-15T21:00:00Z',
  },
  {
    id: 'review-2', bookingId: 'booking-2', experienceId: '3', hostId: 'host-2', guestId: 'user-6', rating: 5,
    comment: 'The food was incredible, and the atmosphere was so peaceful. A truly authentic and meditative dining experience. Highly recommended.',
    createdAt: '2023-10-12T20:00:00Z',
  },
  {
    id: 'review-3', bookingId: 'booking-3', experienceId: '2', hostId: 'host-4', guestId: 'user-7', rating: 5,
    comment: 'The best tacos of my life. Javier has a real passion for his culture and food that shines through. Fun, vibrant, and delicious.',
    createdAt: '2023-11-05T20:00:00Z',
  },
  {
    id: 'review-4', bookingId: 'booking-4', experienceId: '1', hostId: 'host-1', guestId: 'user-8', rating: 5,
    comment: 'Maria is a gem. So welcoming and warm. The food was divine. A must-do in Melbourne!',
    createdAt: '2023-09-20T21:00:00Z',
  }
];

export const mockExperiences: Experience[] = [
  {
    id: '1', hostId: 'host-1', userId: 'user-1', title: 'Nonna\'s Melbourne Pasta Feast', category: 'In-Home Dining',
    description: 'Join me in my charming Carlton home for a journey through Italian cuisine. We\'ll start with classic antipasti, then I\'ll teach you the art of making fresh pasta, just like my nonna taught me. We\'ll finish with a delicious homemade tiramisu.',
    durationMinutes: 180, menu: { cuisine: 'Italian', description: 'A 4-course traditional meal.', dietary: ['Vegetarian option available'], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 85, maxGuests: 6, minGuests: 2 }, availability: { days: ['Wednesday', 'Friday', 'Saturday'], timeSlots: ['19:00', '20:00'] },
    location: { country: 'AU', region: 'VIC', suburb: 'MEL', localArea: 'CARLTON' },
    photos: { mainImageId: 'exp-1-main', thumbnailImageIds: ['exp-1-thumb-1', 'exp-1-thumb-2'] },
    status: 'live', rating: { average: 4.9, count: 134 }, createdAt: '2023-01-12T09:00:00Z',
  },
  {
    id: '2', hostId: 'host-4', userId: 'user-4', title: 'Fitzroy Street Taco Fiesta', category: 'In-Home Dining',
    description: 'Experience the soul of Oaxacan street food without leaving my cozy kitchen in Fitzroy. We\'ll explore different types of masa, craft a variety of fillings, and mix up some zesty salsas. Come hungry and ready for a fiesta!',
    durationMinutes: 150, menu: { cuisine: 'Mexican', description: 'Taco tasting menu with appetizers and dessert.', dietary: ['Gluten-Free', 'Vegan option available'], spiceLevel: 'Medium', },
    pricing: { pricePerGuest: 60, maxGuests: 8, minGuests: 2 }, availability: { days: ['Tuesday', 'Thursday', 'Saturday'], timeSlots: ['18:00', '19:30'] },
    location: { country: 'AU', region: 'VIC', suburb: 'MEL', localArea: 'FITZROY' },
    photos: { mainImageId: 'exp-2-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.8, count: 98 }, createdAt: '2023-04-02T09:00:00Z',
  },
  {
    id: '3', hostId: 'host-2', userId: 'user-2', title: 'Zen & Simplicity: A Japanese Meal', category: 'In-Home Dining',
    description: 'Discover "washoku," the Japanese philosophy of food. In my minimalist Surry Hills home, we will enjoy a simple, elegant meal that highlights the natural flavors of seasonal ingredients. This is a quiet, contemplative experience.',
    durationMinutes: 120, menu: { cuisine: 'Japanese', description: 'A traditional multi-course "ichiju sansai" meal.', dietary: [], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 120, maxGuests: 4, minGuests: 1 }, availability: { days: ['Monday', 'Friday'], timeSlots: ['19:00'] },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'SURRY' },
    photos: { mainImageId: 'exp-3-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.9, count: 72 }, createdAt: '2023-02-16T09:00:00Z',
  },
  {
    id: '4', hostId: 'host-3', userId: 'user-3', title: 'North Indian Family Feast', category: 'Cooking Class',
    description: 'Welcome to our home in Harris Park! My mother and I will guide you through the vibrant flavors of our heritage. You\'ll learn to make classic curries, fresh naan, and a variety of chutneys. It\'s a hands-on, joyful, and delicious celebration.',
    durationMinutes: 210, menu: { cuisine: 'Indian', description: 'An elaborate North Indian meal, served family style.', dietary: ['Vegetarian', 'Vegan'], spiceLevel: 'Spicy', },
    pricing: { pricePerGuest: 55, maxGuests: 8, minGuests: 2 }, availability: { days: ['Saturday', 'Sunday'], timeSlots: ['12:00', '19:00'] },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'HARRISPARK' },
    photos: { mainImageId: 'exp-4-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.85, count: 150 }, createdAt: '2023-03-21T09:00:00Z',
  },
  {
    id: '5', hostId: 'host-5', userId: 'user-9', title: 'Authentic Bangkok Street Food', category: 'In-Home Dining',
    description: 'Taste the flavors of Bangkok\'s bustling streets from the comfort of my home in Newtown. We\'ll enjoy a selection of classic street food dishes, from Pad Thai to spicy green curry.',
    durationMinutes: 150, menu: { cuisine: 'Thai', description: 'A feast of popular Thai street food dishes.', dietary: ['Vegetarian option available'], spiceLevel: 'Spicy', },
    pricing: { pricePerGuest: 65, maxGuests: 6, minGuests: 2 }, availability: { days: ['Friday', 'Saturday'], timeSlots: ['19:00'] },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'NEWTOWN' },
    photos: { mainImageId: 'exp-5-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.9, count: 45 }, createdAt: '2023-05-05T09:00:00Z',
  },
  {
    id: '6', hostId: 'host-6', userId: 'user-10', title: 'Classic French Bistro Dinner', category: 'In-Home Dining',
    description: 'Enjoy a taste of Paris with a classic three-course bistro meal. We\'ll have a hearty Coq au Vin, creamy potato gratin, and a decadent chocolate mousse for dessert.',
    durationMinutes: 180, menu: { cuisine: 'French', description: 'A 3-course classic French meal.', dietary: [], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 95, maxGuests: 4, minGuests: 2 }, availability: { days: ['Thursday', 'Saturday'], timeSlots: ['20:00'] },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'SURRY' },
    photos: { mainImageId: 'exp-6-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.8, count: 32 }, createdAt: '2023-05-06T09:00:00Z',
  },
  {
    id: '7', hostId: 'host-7', userId: 'user-11', title: 'Authentic Hāngi Experience', category: 'Special Event',
    description: 'Join my whānau for a traditional Māori Hāngi. You\'ll see how we prepare the earth oven and slow-cook a feast of meats and vegetables. A true taste of Aotearoa.',
    durationMinutes: 300, menu: { cuisine: 'New Zealand', description: 'A full Hāngi feast with chicken, lamb, and root vegetables.', dietary: [], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 100, maxGuests: 10, minGuests: 4 }, availability: { days: ['Saturday'], timeSlots: ['16:00'] },
    location: { country: 'NZ', region: 'AUK', suburb: 'AKL', localArea: 'PONSONBY' },
    photos: { mainImageId: 'exp-7-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.95, count: 88 }, createdAt: '2023-05-07T09:00:00Z',
  },
  {
    id: '8', hostId: 'host-8', userId: 'user-12', title: 'Aromatic Vietnamese Pho Night', category: 'In-Home Dining',
    description: 'There is nothing more comforting than a bowl of authentic, slow-cooked Pho. I will share my family\'s secret recipe with you in my warm and welcoming home in Wellington.',
    durationMinutes: 120, menu: { cuisine: 'Vietnamese', description: 'Traditional beef pho with all the fresh herb accompaniments.', dietary: [], spiceLevel: 'Medium', },
    pricing: { pricePerGuest: 50, maxGuests: 5, minGuests: 2 }, availability: { days: ['Wednesday', 'Sunday'], timeSlots: ['12:00', '19:00'] },
    location: { country: 'NZ', region: 'WGN', suburb: 'WLG', localArea: 'TEARO' },
    photos: { mainImageId: 'exp-8-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.9, count: 55 }, createdAt: '2023-05-08T09:00:00Z',
  },
  {
    id: '9', hostId: 'host-9', userId: 'user-13', title: 'Lebanese Mezze Feast in Brisbane', category: 'In-Home Dining',
    description: 'A vibrant selection of classic Lebanese mezze, from hummus and baba ghanoush to freshly baked fatayer. Perfect for sharing.',
    durationMinutes: 150, menu: { cuisine: 'Lebanese', description: 'An array of small dishes, perfect for sharing.', dietary: ['Vegetarian'], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 70, maxGuests: 8, minGuests: 4 }, availability: { days: ['Friday', 'Saturday'], timeSlots: ['19:30'] },
    location: { country: 'AU', region: 'QLD', suburb: 'BRI', localArea: 'WESTEND' },
    photos: { mainImageId: 'exp-9-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.9, count: 62 }, createdAt: '2023-06-03T09:00:00Z',
  },
  {
    id: '10', hostId: 'host-10', userId: 'user-14', title: 'Fremantle Seafood BBQ', category: 'Special Event',
    description: 'Enjoy the freshest catch from the Indian Ocean, grilled to perfection on the BBQ. A true taste of West Australian life.',
    durationMinutes: 180, menu: { cuisine: 'Australian', description: 'Grilled local fish, prawns, and salads.', dietary: [], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 90, maxGuests: 6, minGuests: 2 }, availability: { days: ['Sunday'], timeSlots: ['13:00'] },
    location: { country: 'AU', region: 'WA', suburb: 'PER', localArea: 'FREMANTLE' },
    photos: { mainImageId: 'exp-10-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.8, count: 41 }, createdAt: '2023-06-04T09:00:00Z',
  },
  {
    id: '11', hostId: 'host-1', userId: 'user-1', title: 'Pottery & Prosecco Workshop', category: 'Art & Craft',
    description: 'Learn the basics of pottery on the wheel while sipping prosecco in my Carlton studio. A fun and creative evening for all skill levels. You\'ll create your own unique piece to take home.',
    durationMinutes: 120, menu: { cuisine: 'N/A', description: 'Light snacks and prosecco provided.', dietary: [], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 75, maxGuests: 6, minGuests: 2 }, availability: { days: ['Thursday'], timeSlots: ['18:30'] },
    location: { country: 'AU', region: 'VIC', suburb: 'MEL', localArea: 'CARLTON' },
    photos: { mainImageId: 'exp-11-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.9, count: 25 }, createdAt: '2023-07-01T09:00:00Z',
  },
  {
    id: '12', hostId: 'host-2', userId: 'user-2', title: 'Acoustic Folk Music Night', category: 'Music & Dance',
    description: 'Join me for an intimate evening of folk music in my Surry Hills apartment. I\'ll share stories behind the songs and we can enjoy some simple Japanese tea and snacks.',
    durationMinutes: 90, menu: { cuisine: 'Japanese', description: 'Japanese tea and rice crackers.', dietary: [], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 30, maxGuests: 10, minGuests: 2 }, availability: { days: ['Sunday'], timeSlots: ['19:00'] },
    location: { country: 'AU', region: 'NSW', suburb: 'SYD', localArea: 'SURRY' },
    photos: { mainImageId: 'exp-12-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.8, count: 18 }, createdAt: '2023-07-15T09:00:00Z',
  },
  {
    id: '13', hostId: 'host-7', userId: 'user-11', title: 'Ponsonby Heritage Walk', category: 'History & Walks',
    description: 'Explore the historic neighborhood of Ponsonby with me. I\'ll share stories of the area\'s Māori and colonial past, and we\'ll visit significant local landmarks.',
    durationMinutes: 150, menu: { cuisine: 'N/A', description: 'Coffee/tea at a local cafe included.', dietary: [], spiceLevel: 'Mild', },
    pricing: { pricePerGuest: 40, maxGuests: 8, minGuests: 2 }, availability: { days: ['Saturday', 'Sunday'], timeSlots: ['10:00'] },
    location: { country: 'NZ', region: 'AUK', suburb: 'AKL', localArea: 'PONSONBY' },
    photos: { mainImageId: 'exp-13-main', thumbnailImageIds: [] },
    status: 'live', rating: { average: 4.9, count: 33 }, createdAt: '2023-08-01T09:00:00Z',
  }
];

export const mockHostApplications: HostApplication[] = [
    {
        id: 'app-1', hostName: 'Maria', submittedDate: '2023-10-01', status: 'Approved', riskFlag: 'Low',
        userId: 'user-1',
        profile: {
            photoId: 'host-1', bio: 'Passionate Italian home cook...', languages: ['Italian', 'English'],
            culturalBackground: 'Italian', hostingStyles: ['Family-style', 'Storytelling'],
        },
        verification: { idDocId: 'admin-id', selfieId: 'admin-selfie', status: 'Verified' },
        location: { country: 'AU', region: 'VIC', suburb: 'Melbourne', postcode: '3053' },
        homeSetup: { homeType: 'House', seating: 'Table', accessibility: 'Two steps to enter', maxGuests: 6, pets: true, smoking: false },
        experience: {
            title: 'Nonna\'s Melbourne Pasta Feast', description: mockExperiences[0].description,
            durationMinutes: 180, category: 'In-Home Dining',
            menu: { cuisine: 'Italian', description: 'A 4-course traditional Roman meal.', spiceLevel: 'Mild', },
            pricing: mockExperiences[0].pricing, photos: { mainImageId: mockExperiences[0].photos.mainImageId },
        },
        compliance: { foodBusinessRegistered: true, councilName: 'City of Melbourne', foodSafetyTrainingCompleted: true, guidelinesAccepted: true, agreeToFoodSafety: true },
    },
    {
        id: 'app-2', hostName: 'Hemi', submittedDate: '2023-10-20', status: 'Pending', riskFlag: 'Low',
        userId: 'user-11',
        profile: {
            photoId: 'host-7', bio: 'Kia ora! Join my whānau (family) for an authentic Hāngi experience...',
            languages: ['English', 'Te Reo Māori'], culturalBackground: 'Māori', hostingStyles: ['Family-style', 'Storytelling'],
        },
        verification: { idDocId: 'admin-id', selfieId: 'admin-selfie', status: 'Pending' },
        location: { country: 'NZ', region: 'AUK', suburb: 'Auckland', postcode: '1011' },
        homeSetup: { homeType: 'House', seating: 'Mixed', pets: true, smoking: false, maxGuests: 10, accessibility: 'Outdoor event with some uneven ground.' },
        experience: {
            title: 'Authentic Hāngi Experience', description: mockExperiences[6].description,
            durationMinutes: 300, category: 'Special Event',
            menu: { cuisine: 'New Zealand', description: 'A full Hāngi feast with chicken, lamb, and root vegetables.', spiceLevel: 'Mild', },
            pricing: mockExperiences[6].pricing, photos: { mainImageId: mockExperiences[6].photos.mainImageId },
        },
        compliance: { foodBusinessRegistered: true, councilName: 'Auckland Council', guidelinesAccepted: true, agreeToFoodSafety: true },
    },
];

export const mockReports: Report[] = [
    {
        id: 'rep-1', targetType: 'Review', targetId: 'review-1', reason: 'Inappropriate content in review comment.',
        reportedBy: 'Maria (Host)', reportedUserLink: '/admin/users/user-1',
        date: '2023-11-10T14:00:00Z', status: 'Open',
    },
    {
        id: 'rep-2', targetType: 'Experience', targetId: '4', reason: 'Host was unresponsive after booking.',
        reportedBy: 'Sophie (Guest)', reportedUserLink: '/admin/users/user-5',
        date: '2023-11-08T10:30:00Z', status: 'In Progress',
    },
    {
        id: 'rep-3', targetType: 'User', targetId: 'user-6', reason: 'Suspicious activity on user account.',
        reportedBy: 'System Flag', reportedUserLink: null,
        date: '2023-11-05T22:00:00Z', status: 'Resolved',
    }
];
