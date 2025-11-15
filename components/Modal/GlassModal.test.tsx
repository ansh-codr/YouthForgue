import { render, screen } from '@testing-library/react';
import { GlassModal } from './GlassModal';

// Render as controlled open to avoid Radix trigger/portal complexity in unit test
test('renders modal content when open', () => {
  render(
    <GlassModal trigger={<button>Open</button>} open onOpenChange={() => {}}>
      <div>Content</div>
    </GlassModal>
  );
  expect(screen.getByText('Content')).toBeInTheDocument();
});
