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

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('Home', () => {
  it('renders the main heading', async () => {
    await act(async () => {
      render(<Home />);
    });
    const heading = screen.getByRole('heading', {
      name: /Experience Authentic Food & Culture./i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the main paragraph', async () => {
    await act(async () => {
      render(<Home />);
    });
    const paragraph = screen.getByText(
      /Go where culture lives./i
    );
    expect(paragraph).toBeInTheDocument();
  });
});
