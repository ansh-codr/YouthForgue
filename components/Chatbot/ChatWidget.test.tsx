import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWidget } from './ChatWidget';

jest.useFakeTimers();

test('chat widget sends and receives echo', async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<ChatWidget />);
  const toggle = screen.getByRole('button', { name: /toggle chat/i });
  await act(async () => {
    await user.click(toggle);
  });
  const input = screen.getByLabelText(/message/i);
  await act(async () => {
    await user.type(input, 'hello');
  });
  await act(async () => {
    await user.keyboard('{Enter}');
  });
  // fast-forward mock latency for echo bot
  await act(async () => { jest.advanceTimersByTime(200); });
  expect(await screen.findAllByText(/hello/)).toHaveLength(2);
});
