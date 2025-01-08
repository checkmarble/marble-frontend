import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('should render successfully', () => {
    render(<Input aria-label="input" />);

    const input = screen.getByLabelText('input');
    expect(input).toBeInTheDocument();
  });

  it('should be editable', async () => {
    render(<Input aria-label="input" placeholder="placeholder" />);

    const input = screen.getByPlaceholderText('placeholder');
    expect(input).toBeInTheDocument();

    await userEvent.type(input, 'input text');
    expect(input).toHaveValue('input text');
  });

  describe('when debounced prop is used', () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });

    beforeEach(() => {
      vi.useFakeTimers();

      // userEvent.click() fails when used with vi.useFakeTimers()
      // https://github.com/testing-library/user-event/issues/1115
      globalThis.jest = {
        advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
      };
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.restoreAllMocks();
    });

    it('should react with a delay when the debounced prop is used', async () => {
      const mockHandler = vi.fn();
      render(
        <Input
          placeholder="placeholder"
          debounceMs={300}
          onChange={mockHandler}
        />,
      );

      const input = await screen.getByPlaceholderText('placeholder');
      expect(input).toBeInTheDocument();

      await user.type(input, 'input text');
      // Not instantly
      expect(mockHandler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      // Not yet
      expect(mockHandler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should debounce multiple changes', async () => {
      const mockHandler = vi.fn();
      render(
        <Input
          placeholder="placeholder"
          debounceMs={300}
          onChange={mockHandler}
        />,
      );

      const input = await screen.getByPlaceholderText('placeholder');
      expect(input).toBeInTheDocument();

      await user.type(input, 'A');
      vi.advanceTimersByTime(200);
      // Not yet
      expect(mockHandler).not.toHaveBeenCalled();

      await user.type(input, 'B');
      vi.advanceTimersByTime(200);
      // Timer reset, so not yet
      expect(mockHandler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });
});
