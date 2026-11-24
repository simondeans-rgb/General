'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Check, Info, Home, CalendarDays, MessageSquare } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Card, CardHeader, ErrorState, Field, Input, Skeleton } from '@/components/ui';
import { SchoolMark, PoweredBy } from './brand';
import { DEFAULT_BRAND, PRESETS, cssVars, normaliseHex, paletteFor } from '@/lib/brand';
import { cn } from '@/lib/cn';

type Brand = { id: string; name: string; brand_colour: string | null; logo_url: string | null };
const BRAND = `select id, name, brand_colour, logo_url from studio order by created_at limit 1`;
const SAVE = `update studio set name = $2, brand_colour = $3, logo_url = $4, updated_at = now() where id = $1 returning id`;

const MAX_INPUT = 5 * 1024 * 1024;   // what we accept from the person's device
const SIZE = 256;                     // what we keep: plenty for a header and a home screen

/**
 * Turn whatever was chosen into a small PNG. Redrawing on a canvas means an
 * SVG's scripts, a photo's location data and a 20MB original never leave the
 * device — only pixels do.
 */
async function toLogo(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp|svg\+xml|gif)$/.test(file.type)) throw new Error('Choose a PNG, JPG, WebP or SVG image.');
  if (file.size > MAX_INPUT) throw new Error('That image is over 5 MB. Choose a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => fail(new Error('That file could not be read as an image.'));
      i.src = url;
    });
    const w = img.naturalWidth || SIZE, h = img.naturalHeight || SIZE;
    const scale = Math.min(1, SIZE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    let out = canvas.toDataURL('image/png');
    if (out.length > 380_000) out = canvas.toDataURL('image/webp', 0.9);
    if (out.length > 380_000) throw new Error('That logo is too detailed to store. Try a simpler version.');
    return out;
  } finally { URL.revokeObjectURL(url); }
}

export function BrandSettings({ canEdit }: { canEdit: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const current = useRows<Brand>(['brand'], BRAND).data?.[0];
  const [name, setName] = React.useState('');
  const [colour, setColour] = React.useState(DEFAULT_BRAND);
  const [hexInput, setHexInput] = React.useState(DEFAULT_BRAND);
  const [logo, setLogo] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const file = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!current || loaded) return;
    setName(current.name); setColour(current.brand_colour ?? DEFAULT_BRAND);
    setHexInput(current.brand_colour ?? DEFAULT_BRAND); setLogo(current.logo_url); setLoaded(true);
  }, [current, loaded]);

  const palette = paletteFor(colour);
  const dirty = !!current && (name.trim() !== current.name || colour !== (current.brand_colour ?? DEFAULT_BRAND)
                              || logo !== current.logo_url);
  const save = useMutation({
    mutationFn: async () => {
      const rows = await runAs(session, q => q(SAVE, [current!.id, name.trim(), colour === DEFAULT_BRAND ? null : colour, logo]));
      if (!rows.length) throw new Error('Not saved — only the school’s owner can change its brand, and not while the account is paused.');
      return rows;
    },
    onSuccess: () => {
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      qc.invalidateQueries({ queryKey: ['db'] });
    },
  });

  const pickFile = async (f: File | undefined) => {
    setLogoError(null);
    if (!f) return;
    try { setLogo(await toLogo(f)); } catch (e) { setLogoError((e as Error).message); }
    if (file.current) file.current.value = '';
  };

  if (!current) return <Card className="p-4"><Skeleton className="h-40" /></Card>;

  return (
    <Card id="brand">
      <CardHeader title="Your brand" subtitle="How the app looks to your staff, parents and students" />
      <div className="grid gap-5 p-4 md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          <Field label="School name" htmlFor="br-name" required>
            <Input id="br-name" value={name} onChange={e => setName(e.target.value)} disabled={!canEdit} maxLength={120} />
          </Field>

          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-2">Logo</p>
            <div className="flex flex-wrap items-center gap-3">
              <SchoolMark name={name || current.name} logo={logo} className="size-16 border border-line bg-surface" />
              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only"
                         id="br-logo" onChange={e => pickFile(e.target.files?.[0])} />
                  <Button size="sm" onClick={() => file.current?.click()}>
                    <Upload className="size-4" aria-hidden /> {logo ? 'Replace' : 'Upload a logo'}
                  </Button>
                  {logo && <Button size="sm" variant="ghost" onClick={() => setLogo(null)}>
                    <Trash2 className="size-4" aria-hidden /> Remove
                  </Button>}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-[12.5px] text-ink-3">
              {logoError ? <span role="alert" className="text-critical">{logoError}</span>
                : 'PNG, JPG, WebP or SVG. A square logo on a plain or transparent background works best. Without one, your initials are used.'}
            </p>
          </div>

          <fieldset disabled={!canEdit}>
            <legend className="mb-1.5 text-[13px] font-medium text-ink-2">Colour</legend>
            <div role="radiogroup" aria-label="Brand colour" className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button key={p.hex} type="button" role="radio" aria-checked={colour === p.hex} aria-label={p.name} title={p.name}
                  onClick={() => { setColour(p.hex); setHexInput(p.hex); }}
                  className={cn('grid size-10 place-items-center rounded-full ring-offset-2 transition-shadow',
                    colour === p.hex ? 'ring-2 ring-ink' : 'hover:ring-2 hover:ring-line-strong')}
                  style={{ background: p.hex }}>
                  {colour === p.hex && <Check className="size-4 text-white" aria-hidden />}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input type="color" aria-label="Pick any colour" value={colour}
                     onChange={e => { setColour(e.target.value); setHexInput(e.target.value); }}
                     className="h-10 w-12 cursor-pointer rounded-[var(--radius-md)] border border-line-strong bg-surface p-1" />
              <Input aria-label="Colour code" value={hexInput} className="tnum w-32"
                     onChange={e => { setHexInput(e.target.value); const h = normaliseHex(e.target.value); if (h) setColour(h); }}
                     aria-invalid={!normaliseHex(hexInput)} />
              {!normaliseHex(hexInput) && <span className="text-[12.5px] text-critical">Use a code like #1e3a8a</span>}
            </div>
            {palette.adjusted && (
              <p className="mt-2 flex items-start gap-1.5 text-[12.5px] text-ink-2">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>
                  That colour is too light for white text on buttons, so the app uses a deeper shade
                  <span className="mx-1 inline-block size-3 rounded-sm align-[-2px]" style={{ background: palette.accent }} aria-hidden />
                  <span className="tnum">{palette.accent}</span> — everything stays readable.
                </span>
              </p>
            )}
          </fieldset>

          {save.error != null && <ErrorState error={save.error} />}
          {canEdit ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" loading={save.isPending} disabled={!dirty || name.trim().length < 2}
                      onClick={() => save.mutate()}>Save brand</Button>
              {colour !== DEFAULT_BRAND && (
                <Button variant="ghost" onClick={() => { setColour(DEFAULT_BRAND); setHexInput(DEFAULT_BRAND); }}>
                  Use Barre’s colours
                </Button>
              )}
              {saved && <span role="status" className="flex items-center gap-1 text-[13px] text-positive"><Check className="size-4" aria-hidden /> Saved — everyone sees it now</span>}
            </div>
          ) : <p className="text-[12.5px] text-ink-3">Only the school’s owner can change its brand.</p>}
        </div>

        {/* What parents will see, before anyone else does. */}
        <figure aria-label="Preview" style={cssVars(palette) as React.CSSProperties}
          className="overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface-2 shadow-xs">
          <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2.5">
            <SchoolMark name={name || current.name} logo={logo} className="size-8" />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold">{name || current.name}</span>
              <PoweredBy className="mt-0 text-[10px]" />
            </span>
          </div>
          <div className="space-y-2 p-3">
            <div className="rounded-[var(--radius-md)] border border-line bg-surface p-2.5">
              <p className="text-[11px] text-ink-3">Next class</p>
              <p className="text-[13px] font-semibold">Grade 3 Ballet</p>
              <p className="text-[11.5px] text-ink-2">Monday · 17:30 · Studio One</p>
              <span className="mt-1.5 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-ink">Booked</span>
            </div>
            <span className="block rounded-[var(--radius-md)] bg-accent py-2 text-center text-[12.5px] font-medium text-white">Report an absence</span>
          </div>
          <div className="flex border-t border-line bg-surface">
            {[[Home, 'Home', true], [CalendarDays, 'Schedule', false], [MessageSquare, 'Messages', false]].map(([I, l, on]) => {
              const Icon = I as React.ElementType;
              return <span key={l as string} className={cn('flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px]', on ? 'text-accent' : 'text-ink-3')}>
                <Icon className="size-4" aria-hidden />{l as string}</span>;
            })}
          </div>
          <figcaption className="sr-only">Preview of the parent app with this brand</figcaption>
        </figure>
      </div>
    </Card>
  );
}
