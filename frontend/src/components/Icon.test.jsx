import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Icon from './Icon';

describe('Icon', () => {
  it('renders SVG element', () => {
    const { container } = render(<Icon>check_circle</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with aria-hidden attribute', () => {
    const { container } = render(<Icon>check_circle</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with role img', () => {
    const { container } = render(<Icon>check_circle</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
  });

  it('applies className to SVG when provided', () => {
    const { container } = render(<Icon className="text-blue-500 text-2xl">check_circle</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-blue-500');
    expect(svg).toHaveClass('text-2xl');
  });

  it('applies default classes', () => {
    const { container } = render(<Icon>check_circle</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('inline-block');
    expect(svg).toHaveClass('shrink-0');
    expect(svg).toHaveClass('align-middle');
  });

  it('sets fill to currentColor', () => {
    const { container } = render(<Icon>check_circle</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('sets focusable to false', () => {
    const { container } = render(<Icon>check_circle</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('sets viewBox to 0 0 24 24', () => {
    const { container } = render(<Icon>check_circle</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('renders default help_outline icon for unknown icon names', () => {
    const { container } = render(<Icon>unknown_icon_name</Icon>);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const path = svg.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('renders known icon from icon map', () => {
    const { container } = render(<Icon>check_circle</Icon>);
    const svg = container.querySelector('svg');
    const path = svg.querySelector('path');
    expect(path).toBeInTheDocument();
  });
});
