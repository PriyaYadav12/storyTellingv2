// TESTSERVER — fetches a Lottie JSON from /public/lottie/* at runtime,
// mirroring the pattern already used by the production story player
// (useLottieOverlay in apps/web/src/app/story/[id]/page.tsx).

import { useEffect, useState } from "react";

export function useLottieJson(path: string | null) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!path) { setData(null); return; }
    let cancelled = false;
    fetch(path)
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setData(json); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [path]);

  return data;
}
