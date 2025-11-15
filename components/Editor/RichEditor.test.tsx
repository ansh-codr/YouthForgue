import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichEditor } from './RichEditor';

// Simple test: fill fields, toggle preview, submit

test('rich editor basic interaction', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();
  render(<RichEditor onSubmit={handleSubmit} />);
  const titleInput = screen.getByLabelText(/title/i);
  await user.type(titleInput, 'My Post Title');
  const bodyArea = screen.getByLabelText(/body/i);
  await user.type(bodyArea, 'This is some body text for the post.');
  const previewBtn = screen.getByRole('button', { name: /preview/i });
  await user.click(previewBtn);
  expect(screen.getByLabelText(/preview/i)).toBeInTheDocument();
  const publishBtn = screen.getByRole('button', { name: /publish/i });
  await user.click(publishBtn);
  expect(handleSubmit).toHaveBeenCalled();
});
