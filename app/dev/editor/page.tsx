import React from 'react';
import { RichEditor } from '@/components/Editor/RichEditor';

export default function Page() {
  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Editor Demo</h1>
      <RichEditor onSubmit={(d) => { console.info('Submitted', d); }} />
    </div>
  );
}
