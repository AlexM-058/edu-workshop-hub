import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard from '../src/components/MetricCard';
import { useI18n } from '../src/i18n/I18nContext';

// Mock the i18n context
vi.mock('../src/i18n/I18nContext', () => ({
  useI18n: vi.fn(),
}));

// Mock the Icon component
vi.mock('../src/components/Icon', () => ({
  default: ({ children, className }) => (
    <span data-testid="icon" className={className}>
      {children}
    </span>
  ),
}));

describe('MetricCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useI18n.mockReturnValue({
      t: (key) => key,
    });
  });

  it('renders with required props', () => {
    render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
      />
    );

    expect(screen.getByText('Total Workshops')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders icon with correct content', () => {
    render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
      />
    );

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveTextContent('trending_up');
  });

  it('displays meta text when provided', () => {
    render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
        meta="+5 this week"
      />
    );

    expect(screen.getByText('+5 this week')).toBeInTheDocument();
  });

  it('does not display meta when not provided', () => {
    render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
      />
    );

    expect(screen.queryByText('+5 this week')).not.toBeInTheDocument();
  });

  it('applies blue tone styling by default', () => {
    render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
      />
    );

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('applies green tone styling when specified', () => {
    render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
        tone="green"
      />
    );

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('bg-green-50', 'text-green-700');
  });

  it('applies amber tone styling when specified', () => {
    render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
        tone="amber"
      />
    );

    const icon = screen.getByTestId('icon');
    expect(icon).toHaveClass('bg-amber-50', 'text-amber-700');
  });

  it('displays demo text from translations', () => {
    render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
      />
    );

    expect(screen.getByText('common.demo')).toBeInTheDocument();
  });

  it('renders as article element', () => {
    const { container } = render(
      <MetricCard
        icon="trending_up"
        label="Total Workshops"
        value="42"
      />
    );

    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });
});
