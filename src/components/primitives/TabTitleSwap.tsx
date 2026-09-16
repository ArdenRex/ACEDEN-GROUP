'use client';

import { useEffect } from 'react';

/**
 * Quiet, on-brand — not a cutesy "come back!" gimmick. Echoes the
 * product's actual value prop (SITE_DESCRIPTION: "...keeps it
 * coordinated as work changes") rather than begging for attention,
 * matching the site's editorial-precision voice everywhere else.
 */
const AWAY_TITLE = 'Still coordinated while you\u2019re away.';

export function TabTitleSwap() {
  useEffect(() => {
    const originalTitle = document.title;

    function handleVisibilityChange() {
      document.title = document.hidden ? AWAY_TITLE : originalTitle;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.title = originalTitle;
    };
  }, []);

  return null;
}
