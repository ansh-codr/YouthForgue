import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichEditor } from './RichEditor';

// Simple test: fill fields, toggle preview, submit

test('rich editor basic interaction', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();
  render(<RichEditor onSubmit={handleSubmit} />);
  const titleInput = screen.getByLabelText(/title/i);
  await act(async () => {
    await user.type(titleInput, 'My Post Title');
  });
  const bodyArea = screen.getByLabelText(/body/i);
  await act(async () => {
    await user.type(bodyArea, 'This is some body text for the post.');
  });
  const previewBtn = screen.getByRole('button', { name: /preview/i });
  await act(async () => {
    await user.click(previewBtn);
  });
  expect(screen.getByLabelText(/preview/i)).toBeInTheDocument();
  const publishBtn = screen.getByRole('button', { name: /publish/i });
  await act(async () => {
    await user.click(publishBtn);
  });
  await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
});
