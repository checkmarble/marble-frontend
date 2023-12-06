import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { Modal } from './Modal';

describe('Modal', () => {
  it('should open and close successfully', async () => {
    render(
      <Modal.Root>
        <Modal.Trigger>Trigger</Modal.Trigger>
        <Modal.Content>
          <Modal.Title>Modal title</Modal.Title>
          <Modal.Description>
            This is the the modal description
          </Modal.Description>
          <Modal.Close>Cancel</Modal.Close>
        </Modal.Content>
      </Modal.Root>,
    );

    const trigger = screen.getByRole('button', { name: /trigger/i });
    expect(screen.queryByText(/modal title/i)).not.toBeInTheDocument();

    await userEvent.click(trigger);

    expect(screen.getByText(/modal title/i)).toBeInTheDocument();
    expect(
      screen.getByText(/This is the the modal description/i),
    ).toBeInTheDocument();

    const close = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(close);

    expect(screen.queryByText(/modal title/i)).not.toBeInTheDocument();
  });
});
