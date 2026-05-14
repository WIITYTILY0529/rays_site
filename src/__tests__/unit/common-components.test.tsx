import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { TrendIndicator } from '../../components/common/TrendIndicator';
import { TabGroup } from '../../components/common/TabGroup';

describe('LoadingSpinner', () => {
  it('renders with default medium size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner.className).toContain('h-8');
    expect(spinner.className).toContain('w-8');
  });

  it('renders small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner.className).toContain('h-4');
    expect(spinner.className).toContain('w-4');
  });

  it('renders large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner.className).toContain('h-12');
    expect(spinner.className).toContain('w-12');
  });
});

describe('ErrorMessage', () => {
  it('renders error message text', () => {
    render(<ErrorMessage message="Something went wrong" showRetry={false} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows retry button when showRetry is true and onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" showRetry={true} onRetry={onRetry} />);
    const button = screen.getByText('Retry');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when showRetry is false', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error" showRetry={false} onRetry={onRetry} />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" showRetry={true} />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<ErrorMessage message="Error" showRetry={false} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('TrendIndicator', () => {
  it('renders positive trend with green text and upward arrow', () => {
    const { container } = render(<TrendIndicator value={5} />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-green-600');
    expect(span?.textContent).toContain('▲');
    expect(span?.textContent).toContain('+5');
  });

  it('renders negative trend with red text and downward arrow', () => {
    const { container } = render(<TrendIndicator value={-3} />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-red-600');
    expect(span?.textContent).toContain('▼');
    expect(span?.textContent).toContain('-3');
  });

  it('renders neutral trend with gray text for zero', () => {
    const { container } = render(<TrendIndicator value={0} />);
    const span = container.querySelector('span');
    expect(span).toHaveClass('text-gray-500');
    expect(span?.textContent).toContain('—');
    expect(span?.textContent).toContain('0');
  });
});

describe('TabGroup', () => {
  const tabs = ['7d', '14d', '30d'];

  it('renders all tabs', () => {
    render(<TabGroup tabs={tabs} activeTab="7d" onTabChange={() => {}} />);
    tabs.forEach((tab) => {
      expect(screen.getByText(tab)).toBeInTheDocument();
    });
  });

  it('has tablist role on container', () => {
    render(<TabGroup tabs={tabs} activeTab="7d" onTabChange={() => {}} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('has tab role on each button', () => {
    render(<TabGroup tabs={tabs} activeTab="7d" onTabChange={() => {}} />);
    const tabElements = screen.getAllByRole('tab');
    expect(tabElements).toHaveLength(3);
  });

  it('marks active tab with aria-selected', () => {
    render(<TabGroup tabs={tabs} activeTab="14d" onTabChange={() => {}} />);
    const activeTab = screen.getByText('14d');
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    const inactiveTab = screen.getByText('7d');
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<TabGroup tabs={tabs} activeTab="7d" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText('30d'));
    expect(onTabChange).toHaveBeenCalledWith('30d');
  });

  it('applies distinct styling to active tab', () => {
    render(<TabGroup tabs={tabs} activeTab="7d" onTabChange={() => {}} />);
    const activeTab = screen.getByText('7d');
    expect(activeTab.className).toContain('border-b-2');
  });
});
