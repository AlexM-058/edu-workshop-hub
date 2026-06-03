import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MarketingWorkshopCard, CatalogWorkshopCard } from './WorkshopCard';

// Mock the Icon component
vi.mock('./Icon', () => ({
  default: ({ children, className, filled }) => (
    <span data-testid="icon" className={className} data-filled={filled ? 'true' : 'false'}>
      {children}
    </span>
  ),
}));

const marketingWorkshop = {
  image: 'https://example.com/image.jpg',
  badge: 'Nou',
  category: 'Data Science',
  title: 'Applied Digital Pedagogy',
  description: 'Classroom methods with practical data exercises.',
  duration: '12 hours',
  rating: '4.8',
};

const catalogWorkshop = {
  image: 'https://example.com/image.jpg',
  open: true,
  category: 'Data Science',
  title: 'Applied Digital Pedagogy',
  credits: '3 credits',
  facilitator: 'John Doe',
  date: '2026-09-01 - 2026-09-10',
  locationIcon: 'location_on',
  location: 'Online',
  price: '$99',
  note: 'Limited spots',
};

describe('MarketingWorkshopCard', () => {
  it('renders workshop image with correct src', () => {
    const { container } = render(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('displays workshop title', () => {
    render(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('Applied Digital Pedagogy')).toBeInTheDocument();
  });

  it('displays workshop description', () => {
    render(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('Classroom methods with practical data exercises.')).toBeInTheDocument();
  });

  it('displays category with icon', () => {
    render(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('Data Science')).toBeInTheDocument();
  });

  it('displays duration with icon', () => {
    render(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('12 hours')).toBeInTheDocument();
  });

  it('displays rating with star icon', () => {
    render(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    const ratingElements = screen.getAllByText('4.8');
    expect(ratingElements.length).toBeGreaterThan(0);
  });

  it('displays badge with correct styling for "Nou"', () => {
    const { container } = render(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    const badge = container.querySelector('[class*="bg-slate-100"]');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Nou');
  });

  it('displays badge with secondary styling for non-"Nou" badges', () => {
    const workshop = { ...marketingWorkshop, badge: 'Popular' };
    const { container } = render(<MarketingWorkshopCard workshop={workshop} />);
    const badge = container.querySelector('[class*="bg-secondary"]');
    expect(badge).toBeInTheDocument();
  });

  it('renders as article element', () => {
    const { container } = render(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });
});

describe('CatalogWorkshopCard', () => {
  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders workshop image with correct src', () => {
    const { container } = renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('displays workshop title', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Applied Digital Pedagogy')).toBeInTheDocument();
  });

  it('displays category badge', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Data Science')).toBeInTheDocument();
  });

  it('displays credits information', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('3 credits')).toBeInTheDocument();
  });

  it('displays facilitator name', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays workshop date', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('2026-09-01 - 2026-09-10')).toBeInTheDocument();
  });

  it('displays location', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('displays price', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('displays note when provided', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Limited spots')).toBeInTheDocument();
  });

  it('does not display note when not provided', () => {
    const workshop = { ...catalogWorkshop, note: null };
    renderWithRouter(<CatalogWorkshopCard workshop={workshop} />);
    expect(screen.queryByText('Limited spots')).not.toBeInTheDocument();
  });

  it('shows "Enrollment Open" badge when open is true', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Enrollment Open')).toBeInTheDocument();
  });

  it('does not show "Enrollment Open" badge when open is false', () => {
    const workshop = { ...catalogWorkshop, open: false };
    renderWithRouter(<CatalogWorkshopCard workshop={workshop} />);
    expect(screen.queryByText('Enrollment Open')).not.toBeInTheDocument();
  });

  it('renders enrollment button with link', () => {
    const { container } = renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    const link = container.querySelector('a[href="/workshops/1"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Înscrie-te');
  });

  it('renders as article element', () => {
    const { container } = renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });
});
