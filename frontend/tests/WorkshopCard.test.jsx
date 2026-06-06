import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MarketingWorkshopCard, CatalogWorkshopCard } from '../src/components/WorkshopCard';
import { I18nContext } from '../src/i18n/I18nContext';

// Mock the Icon component
vi.mock('../src/components/Icon', () => ({
  default: ({ children, className, filled }) => (
    <span data-testid="icon" className={className} data-filled={filled ? 'true' : 'false'}>
      {children}
    </span>
  ),
}));

const marketingWorkshop = {
  id: 1,
  is_open: true,
  max_slots: 24,
  occupied_slots: 8,
  referent: { name: 'John Doe' },
  title: {
    ro: 'Pedagogie digitală aplicată',
    de: 'Angewandte digitale Pädagogik',
  },
  description: {
    ro: 'Metode practice pentru clase digitale.',
    de: 'Praktische Methoden für digitale Klassen.',
  },
};

const catalogWorkshop = {
  id: 1,
  available_slots: 16,
  is_open: true,
  location: 'Online',
  max_slots: 24,
  occupied_slots: 8,
  referent: { name: 'John Doe' },
  scheduled_at: '2026-09-01T10:00:00.000Z',
  title: {
    ro: 'Pedagogie digitală aplicată',
    de: 'Angewandte digitale Pädagogik',
  },
};

function renderWithI18n(ui, { locale = 'ro', router = true } = {}) {
  const content = (
    <I18nContext.Provider value={{ locale, setLocale: vi.fn(), t: (key) => key }}>
      {ui}
    </I18nContext.Provider>
  );

  return render(router ? <BrowserRouter>{content}</BrowserRouter> : content);
}

describe('MarketingWorkshopCard', () => {
  it('renders workshop image with correct src', () => {
    const { container } = renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('googleusercontent.com'));
  });

  it('displays workshop title', () => {
    renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('Pedagogie digitală aplicată')).toBeInTheDocument();
  });

  it('displays workshop description', () => {
    renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('Metode practice pentru clase digitale.')).toBeInTheDocument();
  });

  it('displays referent with icon', () => {
    renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays occupancy with icon', () => {
    renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('8/24')).toBeInTheDocument();
  });

  it('links to workshop details', () => {
    const { container } = renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />, { router: true });
    const link = container.querySelector('a[href="/workshops/1"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Detalii');
  });

  it('displays open enrollment badge when open', () => {
    renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    expect(screen.getByText('Înscrieri deschise')).toBeInTheDocument();
  });

  it('uses the selected locale for marketing copy', () => {
    renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />, { locale: 'de' });
    expect(screen.getByText('Angewandte digitale Pädagogik')).toBeInTheDocument();
    expect(screen.getByText('Praktische Methoden für digitale Klassen.')).toBeInTheDocument();
  });

  it('renders as article element', () => {
    const { container } = renderWithI18n(<MarketingWorkshopCard workshop={marketingWorkshop} />);
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });
});

describe('CatalogWorkshopCard', () => {
  const renderWithRouter = (component) => {
    return renderWithI18n(component, { router: true });
  };

  it('renders workshop image with correct src', () => {
    const { container } = renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('googleusercontent.com'));
  });

  it('displays workshop title', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Pedagogie digitală aplicată')).toBeInTheDocument();
  });

  it('displays workshop badge', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Workshop')).toBeInTheDocument();
  });

  it('displays available slot count', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('16 locuri libere')).toBeInTheDocument();
  });

  it('displays facilitator name', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays workshop date', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('1 septembrie 2026')).toBeInTheDocument();
  });

  it('displays location', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('displays occupancy', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('8/24')).toBeInTheDocument();
    expect(screen.getByText('Participanți')).toBeInTheDocument();
  });

  it('shows open enrollment badge when open is true', () => {
    renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    expect(screen.getByText('Înscrieri deschise')).toBeInTheDocument();
  });

  it('does not show open enrollment badge when open is false', () => {
    const workshop = { ...catalogWorkshop, is_open: false };
    renderWithRouter(<CatalogWorkshopCard workshop={workshop} />);
    expect(screen.queryByText('Înscrieri deschise')).not.toBeInTheDocument();
  });

  it('renders details button with link', () => {
    const { container } = renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    const link = container.querySelector('a[href="/workshops/1"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Detalii');
  });

  it('uses German labels when locale is de', () => {
    renderWithI18n(<CatalogWorkshopCard workshop={catalogWorkshop} />, { locale: 'de', router: true });

    expect(screen.getByText('Angewandte digitale Pädagogik')).toBeInTheDocument();
    expect(screen.getByText('16 Plätze frei')).toBeInTheDocument();
    expect(screen.getByText('Teilnehmende')).toBeInTheDocument();
  });

  it('renders as article element', () => {
    const { container } = renderWithRouter(<CatalogWorkshopCard workshop={catalogWorkshop} />);
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });
});
