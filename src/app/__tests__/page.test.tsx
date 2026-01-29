import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Home from '../page';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Award: () => <div>Award Icon</div>,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: jest.fn(),
    }),
}));

// Mock the HeroSearch component
jest.mock('@/components/home/hero-search', () => ({
  HeroSearch: () => <div>Hero Search</div>,
}));

// Mock the other sections
jest.mock('@/components/home/how-it-works', () => ({
  HowItWorksSection: () => <div>How It Works</div>,
}));

jest.mock('@/components/home/featured-experiences', () => ({
  FeaturedExperiencesSection: () => <div>Featured Experiences</div>,
}));

jest.mock('@/components/home/featured-cities', () => ({
  FeaturedCitiesSection: () => <div>Featured Cities</div>,
}));

jest.mock('@/components/home/testimonials', () => ({
  TestimonialsSection: () => <div>Testimonials</div>,
}));

jest.mock('@/components/home/featured-sponsors', () => ({
  FeaturedSponsorsSection: () => <div>Featured Sponsors</div>,
}));


// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('Home', () => {
  beforeEach(async () => {
    await act(async () => {
      render(<Home />);
    });
  });

  it('renders the main heading', () => {
    const heading = screen.getByRole('heading', {
      name: /Experience Authentic Food & Culture./i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the main paragraph', () => {
    const paragraph = screen.getByText(
      /Go where culture lives/i
    );
    expect(paragraph).toBeInTheDocument();
  });
  
  it('renders the HeroSearch component', () => {
    expect(screen.getByText('Hero Search')).toBeInTheDocument();
  });

  it('renders the HowItWorks section', () => {
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });

  it('renders the FeaturedExperiences section', () => {
    expect(screen.getByText('Featured Experiences')).toBeInTheDocument();
  });

  it('renders the FeaturedCities section', () => {
    expect(screen.getByText('Featured Cities')).toBeInTheDocument();
  });
  
  it('renders the Testimonials section', () => {
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
  });
  
  it('renders the FeaturedSponsors section', () => {
    expect(screen.getByText('Featured Sponsors')).toBeInTheDocument();
  });
});
