import type { ComponentProps } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThresholdRange, type ThresholdRangeStep } from './ThresholdRange';

const steps: ThresholdRangeStep[] = [
  { value: 0, label: '0', color: 'red' },
  { value: 40, label: '', color: 'red' },
  { value: 50, label: '', color: 'orange' },
  { value: 60, label: '', color: 'yellow' },
  { value: 70, label: '', color: 'teal' },
  { value: 80, label: '80', color: 'green' },
];

let container: HTMLDivElement | null = null;
let root: Root | null = null;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  if (root) {
    act(() => {
      root?.unmount();
    });
  }
  container?.remove();
  root = null;
  container = null;
});

function renderThresholdRange(overrides: Partial<ComponentProps<typeof ThresholdRange>> = {}) {
  const onChange = vi.fn();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root?.render(
      <ThresholdRange
        title="Seuil de match"
        defaultDescription="Lorem ipsum signification match"
        initialColor="var(--color-red-primary)"
        value={50}
        onChange={onChange}
        values={steps}
        {...overrides}
      />,
    );
  });

  return { onChange, container };
}

function getSlider() {
  const slider = container?.querySelector('[role="slider"]');
  expect(slider).toBeTruthy();
  return slider as HTMLDivElement;
}

describe('ThresholdRange', () => {
  it('renders the current selected value', () => {
    renderThresholdRange({ value: 70 });

    expect(getSlider().getAttribute('aria-valuenow')).toBe('70');
    expect(container?.textContent).toContain('70');
  });

  it('clicking a dot selects the exact configured step', () => {
    const { onChange } = renderThresholdRange();
    const button = container?.querySelector('button[aria-label="Seuil de match 60"]');
    expect(button).toBeTruthy();

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith(60);
  });

  it('dragging the active thumb picks the nearest configured values', () => {
    const { onChange } = renderThresholdRange({ value: 40 });
    const rail = container?.querySelector('[data-testid="threshold-range-rail"]') as HTMLDivElement | null;
    const thumb = container?.querySelector('[data-testid="threshold-range-thumb-active"]');
    expect(rail).toBeTruthy();
    expect(thumb).toBeTruthy();

    vi.spyOn(rail!, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 12,
      top: 0,
      right: 100,
      bottom: 12,
      left: 0,
      toJSON: () => ({}),
    });

    act(() => {
      thumb?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, pointerId: 1 }));
      rail?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 63, pointerId: 1 }));
      rail?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 75, pointerId: 1 }));
      rail?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 75, pointerId: 1 }));
    });

    expect(onChange).toHaveBeenNthCalledWith(1, 50);
    expect(onChange).toHaveBeenNthCalledWith(2, 60);
    expect(onChange).toHaveBeenNthCalledWith(3, 70);
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('does not revert to the previous step when the drag ends', () => {
    const { onChange } = renderThresholdRange({ value: 60 });
    const rail = container?.querySelector('[data-testid="threshold-range-rail"]') as HTMLDivElement | null;
    const thumb = container?.querySelector('[data-testid="threshold-range-thumb-active"]');
    const previousStepButton = container?.querySelector('button[aria-label="Seuil de match 60"]');
    expect(rail).toBeTruthy();
    expect(thumb).toBeTruthy();
    expect(previousStepButton).toBeTruthy();

    vi.spyOn(rail!, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 12,
      top: 0,
      right: 100,
      bottom: 12,
      left: 0,
      toJSON: () => ({}),
    });

    act(() => {
      thumb?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 70, pointerId: 1 }));
      rail?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 75, pointerId: 1 }));
      rail?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 75, pointerId: 1 }));
      previousStepButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onChange).not.toHaveBeenCalledWith(60);
    expect(onChange).toHaveBeenLastCalledWith(70);
  });

  it('clicking the rail picks the nearest configured value', () => {
    const { onChange } = renderThresholdRange();
    const rail = container?.querySelector('[data-testid="threshold-range-rail"]') as HTMLDivElement | null;
    expect(rail).toBeTruthy();

    vi.spyOn(rail!, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 12,
      top: 0,
      right: 100,
      bottom: 12,
      left: 0,
      toJSON: () => ({}),
    });

    act(() => {
      rail?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 63 }));
    });

    expect(onChange).toHaveBeenCalledWith(60);
  });

  it('supports keyboard navigation across configured values only', () => {
    const { onChange } = renderThresholdRange({ value: 50 });
    const slider = getSlider();

    act(() => {
      slider.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
      slider.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
      slider.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Home' }));
      slider.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
    });

    expect(onChange).toHaveBeenNthCalledWith(1, 60);
    expect(onChange).toHaveBeenNthCalledWith(2, 40);
    expect(onChange).toHaveBeenNthCalledWith(3, 0);
    expect(onChange).toHaveBeenNthCalledWith(4, 80);
  });

  it('does not interact when disabled', () => {
    const { onChange } = renderThresholdRange({ disabled: true });
    const rail = container?.querySelector('[data-testid="threshold-range-rail"]');
    const button = container?.querySelector('button[aria-label="Seuil de match 60"]');
    const thumb = container?.querySelector('[data-testid="threshold-range-thumb-active"]');

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      rail?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 63 }));
      thumb?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 63 }));
      thumb?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 75 }));
      getSlider().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the initial gradient before the first step when there is no zero value', () => {
    renderThresholdRange({
      value: 40,
      initialColor: 'rgb(210, 55, 29)',
      values: [
        { value: 40, label: '', color: 'rgb(255, 0, 0)' },
        { value: 50, label: '', color: 'orange' },
        { value: 80, label: '80', color: 'green' },
      ],
    });

    const segments = container?.querySelectorAll('[data-testid="threshold-range-rail"] > div[aria-hidden="true"]');
    const firstSegment = segments?.[0] as HTMLDivElement | undefined;

    expect(firstSegment).toBeTruthy();
    expect(firstSegment?.style.left).toBe('0%');
    expect(firstSegment?.style.background).toContain('linear-gradient');
    expect(firstSegment?.style.background).toContain('rgb(210, 55, 29)');
    expect(firstSegment?.style.background).toContain('rgb(255, 0, 0)');
  });
});
