'use client';

import * as React from 'react';
import { Button, SectionHead } from '@/components/ui';
import { useRows } from '@/lib/query';
import { installIdentity, installPlatform, installSteps, type InstallSchool } from '@/lib/install-identity';
import { drawSchoolIcon, runningInstalled, useInstallPrompt } from './pwa';

const DISMISSED = 'barre.install-guide.dismissed.v1';
const read = () => { try { return localStorage.getItem(DISMISSED) === '1'; } catch { return false; } };

/**
 * "Add Northstar to your home screen" (round-2 review, F4): the school's own
 * icon and name as they will appear, then the steps for this phone. Hidden
 * once the app runs from the home screen, or when the parent says not now.
 */
export function InstallGuide() {
  const school = useRows<InstallSchool>(['install-school'],
    `select name, brand_colour, logo_url, theme, brand_secondary from studio order by created_at limit 1`, [], { staleTime: 60_000 }).data?.[0];
  const id = installIdentity(school);
  const install = useInstallPrompt();
  const [state, setState] = React.useState<{ hidden: boolean; platform: ReturnType<typeof installPlatform> } | null>(null);
  const [icon, setIcon] = React.useState('');
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    setState({ hidden: read() || runningInstalled(), platform: installPlatform(navigator.userAgent, navigator.maxTouchPoints) });
  }, []);
  React.useEffect(() => {
    if (!id.school) return;
    let off = false;
    drawSchoolIcon(id, 180).then(u => { if (!off) setIcon(u); }).catch(() => undefined);
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id.name, id.icon.ground, id.icon.logo]);

  if (!state || state.hidden || !id.school) return null;
  const steps = installSteps(state.platform, id.shortName, install.available);
  const dismiss = () => { try { localStorage.setItem(DISMISSED, '1'); } catch { /* private window */ } setState({ ...state, hidden: true }); };

  return (
    <section aria-labelledby="install-h">
      <SectionHead id="install-h" title={`Add ${id.shortName} to your home screen`}
        action={<Button size="sm" variant="ghost" onClick={dismiss}>Not now</Button>} />
      <div className="flex items-start gap-4 pt-3">
        <figure className="flex w-16 shrink-0 flex-col items-center">
          {icon
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={icon} alt="" className="size-14 rounded-[0.875rem] shadow-sm" />
            : <span aria-hidden className="size-14 rounded-[0.875rem]" style={{ background: id.icon.ground }} />}
          <figcaption className="mt-1 w-full truncate text-center text-[0.75rem] text-ink-2">{id.shortName}</figcaption>
        </figure>
        <div className="min-w-0 flex-1">
          <p className="text-[0.9375rem] text-ink-2">
            Open {id.name} like an app, with its own icon, straight to this page.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[0.9375rem] marker:font-semibold marker:text-ink-3">
            {steps.map(s => <li key={s}>{s}</li>)}
          </ol>
          {install.available && !added && (
            <Button className="mt-3" onClick={async () => { if (await install.prompt()) setAdded(true); }}>Add to home screen</Button>
          )}
          {added && <p className="mt-3 text-[0.9375rem]"><span className="font-semibold text-positive">Added.</span> {id.shortName} is on your home screen.</p>}
        </div>
      </div>
    </section>
  );
}
