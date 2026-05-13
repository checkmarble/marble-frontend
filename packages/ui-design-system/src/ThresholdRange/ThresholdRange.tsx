import type { KeyboardEvent } from 'react';
import { cn } from 'ui-design-system';

export type ThresholdRangeStep = {
  value: number;
  label?: string;
  color: string;
};

export type ThresholdRangeProps = {
  title?: string;
  description?: string;
  values: ThresholdRangeStep[];
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  initialColor: string;
  name?: string;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
};

const RAIL_HEIGHT = 4;
const INACTIVE_DOT_SIZE = 8;
const ACTIVE_DOT_SIZE = 16;

function getSortedSteps(values: ThresholdRangeStep[]) {
  return [...values].sort((a, b) => a.value - b.value);
}

function getStepLabel(step: ThresholdRangeStep | undefined) {
  if (!step) return '';
  return step.label && step.label.length > 0 ? step.label : step.value.toString();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSegments(steps: ThresholdRangeStep[], min: number, initialColor: string) {
  const firstStep = steps[0];
  if (!firstStep) return [];

  const segments = [];

  if (firstStep.value > 0) {
    segments.push({
      key: `initial-${firstStep.value}`,
      startValue: min,
      endValue: firstStep.value,
      fromColor: initialColor,
      toColor: firstStep.color,
      completedStepIndex: 0,
    });
  }

  for (let index = 0; index < steps.length - 1; index += 1) {
    const step = steps[index]!;
    const nextStep = steps[index + 1]!;

    segments.push({
      key: `${step.value}-${nextStep.value}`,
      startValue: step.value,
      endValue: nextStep.value,
      fromColor: step.color,
      toColor: nextStep.color,
      completedStepIndex: index + 1,
    });
  }

  return segments;
}

export function ThresholdRange({
  title,
  description,
  values,
  value,
  onChange,
  min = 0,
  max = 100,
  initialColor,
  name,
  onBlur,
  disabled = false,
  className,
}: ThresholdRangeProps) {
  const steps = getSortedSteps(values);

  if (steps.length === 0) {
    throw new Error('ThresholdRange requires at least one step.');
  }

  const normalizedMax = Math.max(max, steps.at(-1)!.value, 1);
  const firstStep = steps[0]!;
  const lastStep = steps.at(-1)!;
  const activeIndex = steps.findIndex((step) => step.value === value);
  const activeStep = activeIndex >= 0 ? steps[activeIndex] : undefined;
  const segments = getSegments(steps, min, initialColor);

  const selectStepAtIndex = (index: number) => {
    if (disabled) return;
    const nextStep = steps[clamp(index, 0, steps.length - 1)];
    if (!nextStep) return;
    if (nextStep.value !== value) {
      onChange(nextStep.value);
    }
  };

  const selectNearestStep = (clientX: number, element: HTMLDivElement) => {
    if (disabled) return;
    const rect = element.getBoundingClientRect();
    const rawRatio = (clientX - rect.left) / rect.width;
    const ratio = clamp(rawRatio, 0, 1);
    const targetValue = ratio * normalizedMax;

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    steps.forEach((step, index) => {
      const distance = Math.abs(step.value - targetValue);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    selectStepAtIndex(nearestIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp': {
        event.preventDefault();
        if (activeIndex < 0) {
          selectStepAtIndex(0);
          return;
        }
        selectStepAtIndex(activeIndex + 1);
        return;
      }
      case 'ArrowLeft':
      case 'ArrowDown': {
        event.preventDefault();
        if (activeIndex < 0) {
          selectStepAtIndex(steps.length - 1);
          return;
        }
        selectStepAtIndex(activeIndex - 1);
        return;
      }
      case 'Home':
        event.preventDefault();
        selectStepAtIndex(0);
        return;
      case 'End':
        event.preventDefault();
        selectStepAtIndex(steps.length - 1);
        return;
      default:
        return;
    }
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {name ? <input type="hidden" name={name} value={value ?? ''} /> : null}

      <div className="flex flex-col gap-4">
        {title ? <div className="text-grey-primary text-s font-medium">{title}</div> : null}

        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-valuemin={firstStep.value}
          aria-valuemax={lastStep.value}
          aria-valuenow={value}
          aria-valuetext={getStepLabel(activeStep)}
          className={cn(
            'rounded-lg px-2 pb-2 pt-3 focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-purple-primary',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          )}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
        >
          <div className="relative px-3 pb-2">
            <div
              data-testid="threshold-range-rail"
              className="bg-grey-border relative w-full rounded-full"
              style={{ height: `${RAIL_HEIGHT}px` }}
              onClick={(event) => selectNearestStep(event.clientX, event.currentTarget)}
            >
              {segments.map((segment) => {
                const start = (segment.startValue / normalizedMax) * 100;
                const end = (segment.endValue / normalizedMax) * 100;
                const width = end - start;
                const isCompleted = activeIndex >= segment.completedStepIndex;
                const background = isCompleted
                  ? `linear-gradient(90deg, ${segment.fromColor} 0%, ${segment.toColor} 100%)`
                  : undefined;

                return (
                  <div
                    key={segment.key}
                    aria-hidden="true"
                    className={cn('absolute rounded-full', isCompleted ? '' : 'bg-grey-border')}
                    style={{
                      left: `${start}%`,
                      width: `${width}%`,
                      height: `${RAIL_HEIGHT}px`,
                      background,
                    }}
                  />
                );
              })}

              {steps.map((step, index) => {
                const position = (step.value / normalizedMax) * 100;
                const isActive = index === activeIndex;
                const isCompleted = activeIndex >= index;
                const size = isActive ? ACTIVE_DOT_SIZE : INACTIVE_DOT_SIZE;
                const backgroundColor = isCompleted ? step.color : 'var(--color-grey-border)';

                return (
                  <button
                    key={step.value}
                    type="button"
                    tabIndex={-1}
                    aria-label={`${title} ${getStepLabel(step)}`}
                    disabled={disabled}
                    className={cn(
                      'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-0 p-0',
                      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                    )}
                    style={{
                      left: `${position}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor,
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      selectStepAtIndex(index);
                    }}
                  />
                );
              })}
            </div>

            {activeStep ? (
              <div
                className="absolute top-full text-s leading-none font-medium"
                style={{
                  left: `${(activeStep.value / normalizedMax) * 100}%`,
                  transform: 'translateX(-50%)',
                  color: activeStep.color,
                }}
              >
                {getStepLabel(activeStep)}
              </div>
            ) : null}

            {activeStep?.value !== lastStep.value ? (
              <div
                className="text-grey-placeholder absolute top-full text-s leading-none font-medium"
                style={{
                  left: `${(lastStep.value / normalizedMax) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {getStepLabel(lastStep)}
              </div>
            ) : null}
          </div>
        </div>

        {description ? <p className="text-grey-placeholder text-xs leading-tight">{description}</p> : null}
      </div>
    </div>
  );
}
