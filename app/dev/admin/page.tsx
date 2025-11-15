import React from 'react';

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-4 space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Widgets (Skeleton)</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Panel title="Flagged Content">
          Review queue coming soon…
        </Panel>
        <Panel title="Spotlight Selector">
          Choose this week’s featured project…
        </Panel>
        <Panel title="Tag Manager">
          Add/remove tags and colors…
        </Panel>
      </div>
    </div>
  );
}
