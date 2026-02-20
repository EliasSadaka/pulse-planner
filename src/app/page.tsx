export default function Home() {
  return (
    <div className="grid gap-6 py-12">
      <section className="rounded-2xl bg-indigo-600 px-8 py-12 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">PulsePlanner</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Plan events without friction.</h1>
        <p className="mt-4 max-w-2xl text-indigo-100">
          Create events, invite people via secure links, track RSVP statuses, and use practical AI helpers
          for better descriptions and conflict-aware scheduling.
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/auth/signup" className="rounded-md bg-white px-4 py-2 text-sm font-medium text-indigo-700">
            Start free
          </a>
          <a href="/search" className="rounded-md border border-indigo-300 px-4 py-2 text-sm font-medium text-white">
            Explore public events
          </a>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Event Management", "Create and edit events with rich details and timeline controls."],
          ["RSVP + Invites", "Track attending, maybe, and declined statuses with tokenized invites."],
          ["AI Copilot", "Enhance descriptions, detect conflicts, and draft invite messages."],
        ].map(([title, detail]) => (
          <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
