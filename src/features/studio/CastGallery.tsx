import { useState } from 'react';
import { Character, poses, type Pose } from '@/art/cast/Character';
import { castIds } from '@/art/cast/species';

/** Development-only page to review every character and pose side by side. */
export function CastGallery() {
  const [pose, setPose] = useState<Pose>('idle');
  const params = new URLSearchParams(location.search);
  const only = params.get('id');
  return (
    <div className="mx-auto w-full max-w-6xl p-4 font-ui">
      <h1 className="mb-3 text-3xl font-extrabold">Cast</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {poses.map((p) => (
          <button key={p} type="button" onClick={() => setPose(p)} className={`rounded-full border-2 border-outline px-3 py-1 ${p === pose ? 'bg-accent' : 'bg-surface'}`}>
            {p}
          </button>
        ))}
      </div>
      {only ? (
        <div className="flex flex-wrap gap-4">
          {poses.map((p) => (
            <figure key={p} className="flex flex-col items-center rounded-2xl bg-surface p-2">
              <Character id={only} pose={p} size={150} />
              <figcaption>{p}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
          {castIds.map((id) => (
            <figure key={id} className="flex flex-col items-center rounded-2xl bg-surface p-2">
              <Character id={id} pose={pose} size={130} />
              <figcaption className="text-sm">{id}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
