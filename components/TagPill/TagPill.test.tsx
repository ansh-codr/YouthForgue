import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagPill } from './TagPill';

test('renders tag pill and handles remove', async () => {
  const user = userEvent.setup();
  const onRemove = jest.fn();
  render(<TagPill label="React" onRemove={onRemove} />);
  expect(screen.getByText('React')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /remove react/i }));
  expect(onRemove).toHaveBeenCalled();
});
