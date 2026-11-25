'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Check, Info, Home, CalendarDays, MessageSquare, Play, Bell, BarChart3 } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, Card, CardHeader, ErrorState, Field, Input, Skeleton } from '@/components/ui';
import { SchoolMark, PoweredBy } from './brand';
import { cssVars, normaliseHex, paletteFor } from '@/lib/brand';
import { THEMES, themeOf, type Theme, type ThemeId } from '@/lib/theme';
import { cn } from '@/lib/cn';

type Brand = { id: string; name: string; brand_colour: string | null; logo_url: string | null; theme: ThemeId; brand_secondary: string | null };
const BRAND = `select id, name, brand_colour, logo_url, theme, brand_secondary from studio order by created_at limit 1`;
const SAVE = `update studio set name = $2, brand_colour = $3, logo_url = $4, theme = $5, brand_secondary = $6, updated_at = now() where id = $1 returning id`;

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

/** The variables a preview needs to show a theme with given colours, whatever the page around it. */
function previewVars(t: Theme, accent: string, secondary: string): React.CSSProperties {
  return { ...cssVars(paletteFor(accent, t.surface)), '--color-secondary': secondary } as React.CSSProperties;
}

export function BrandSettings({ canEdit }: { canEdit: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const current = useRows<Brand>(['brand'], BRAND).data?.[0];
  const [name, setName] = React.useState('');
  const [theme, setTheme] = React.useState<ThemeId>('classic');
  const [colour, setColour] = React.useState(THEMES.classic.accent);
  const [second, setSecond] = React.useState(THEMES.classic.secondary);
  const [logo, setLogo] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const file = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!current || loaded) return;
    const t = themeOf(current.theme);
    setName(current.name); setTheme(t.id);
    setColour(current.brand_colour ?? t.accent); setSecond(current.brand_secondary ?? t.secondary);
    setLogo(current.logo_url); setLoaded(true);
  }, [current, loaded]);

  const t = THEMES[theme];
  const palette = paletteFor(colour, t.surface);
  const isPreset = (th: Theme) => th.presets.some(p => p.accent === colour && p.secondary === second);

  // Switching theme brings that theme's colours — unless the school has its own.
  const chooseTheme = (id: ThemeId) => {
    if (id === theme) return;
    if (isPreset(THEMES[theme])) { setColour(THEMES[id].accent); setSecond(THEMES[id].secondary); }
    setTheme(id);
  };

  const dirty = !!current && (name.trim() !== current.name || theme !== current.theme
    || colour !== (current.brand_colour ?? themeOf(current.theme).accent)
    || second !== (current.brand_secondary ?? themeOf(current.theme).secondary) || logo !== current.logo_url);
  const save = useMutation({
    mutationFn: async () => {
      const rows = await runAs(session, q => q(SAVE, [current!.id, name.trim(),
        colour === t.accent ? null : colour, logo, theme, second === t.secondary ? null : second]));
      if (!rows.length) throw new Error('Not saved — only the school’s owner can change its brand, and not while the account is paused.');
      return rows;
    },
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); qc.invalidateQueries({ queryKey: ['db'] }); },
  });

  const pickFile = async (f: File | undefined) => {
    setLogoError(null);
    if (!f) return;
    try { setLogo(await toLogo(f)); } catch (e) { setLogoError((e as Error).message); }
    if (file.current) file.current.value = '';
  };

  if (!current) return <Card className="p-4"><Skeleton className="h-40" /></Card>;
  const school = name || current.name;

  return (
    <Card id="brand">
      <CardHeader title="Your brand" subtitle="Choose a style, then make it yours with your colours and logo" />
      <div className="space-y-6 p-4">
        {/* 1. The style */}
        <fieldset disabled={!canEdit}>
          <legend className="mb-2 text-[13px] font-medium text-ink-2">1 · Style</legend>
          <div role="radiogroup" aria-label="Style" className="grid gap-3 sm:grid-cols-2">
            {(Object.values(THEMES) as Theme[]).map(th => {
              const on = th.id === theme;
              const a = on ? colour : th.accent, b = on ? second : th.secondary;
              return (
                <button key={th.id} type="button" role="radio" aria-checked={on} onClick={() => chooseTheme(th.id)}
                  className={cn('overflow-hidden rounded-[var(--radius-lg)] border-2 text-left transition-shadow',
                    on ? 'border-accent-line shadow-md' : 'border-line hover:border-line-strong')}>
                  <div data-theme={th.id} style={previewVars(th, a, b)} className="pointer-events-none">
                    <MiniScreen school={school} logo={logo} dark={th.dark} />
                  </div>
                  <div className="flex items-start gap-2 bg-surface px-3 py-2.5">
                    <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border', on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong')}>
                      {on && <Check className="size-3" aria-hidden />}
                    </span>
                    <span><span className="block font-semibold">{th.name}</span><span className="block text-[12.5px] text-ink-2">{th.tagline}</span></span>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            {/* 2. Colours */}
            <fieldset disabled={!canEdit}>
              <legend className="mb-1.5 text-[13px] font-medium text-ink-2">2 · Colours</legend>
              <p className="mb-2 text-[12.5px] text-ink-3">Pick a pairing made for {t.name}, or enter the exact colours from your brand guidelines.</p>
              <div role="radiogroup" aria-label="Colour pairings" className="flex flex-wrap gap-2">
                {t.presets.map(p => {
                  const on = colour === p.accent && second === p.secondary;
                  return (
                    <button key={p.name} type="button" role="radio" aria-checked={on} title={p.name} aria-label={`${p.name}: ${p.accent.toUpperCase()} and ${p.secondary.toUpperCase()}`}
                      onClick={() => { setColour(p.accent); setSecond(p.secondary); }}
                      className={cn('flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[12.5px]', on ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-line-strong')}>
                      <span className="flex">
                        <span className="size-6 rounded-full ring-2 ring-surface" style={{ background: p.accent }} />
                        <span className="-ml-2 size-6 rounded-full ring-2 ring-surface" style={{ background: p.secondary }} />
                      </span>
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <HexField id="br-hex" label="Main colour" hint="Buttons, highlights, active tabs" value={colour} onChange={setColour} />
                <HexField id="br-hex2" label="Second colour" hint={t.dark ? 'The glow behind screens, and gradients' : 'Gradients and accents'} value={second} onChange={setSecond} />
              </div>
              {(palette.darkText || palette.textDeepened) && (
                <p className="mt-2 flex items-start gap-1.5 text-[12.5px] text-ink-2">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>
                    Your colour is used exactly{palette.darkText ? '; it is light, so text on your buttons will be black to stay readable' : ''}.
                    {palette.textDeepened && <> Links drawn in your colour use a {t.dark ? 'lighter' : 'deeper'} shade
                      <span className="mx-1 inline-block size-3 rounded-sm align-[-2px]" style={{ background: palette.text }} aria-hidden />
                      <span className="tnum uppercase">{palette.text}</span> so they can be read.</>}
                  </span>
                </p>
              )}
            </fieldset>

            {/* 3. Name and logo */}
            <div className="space-y-4">
              <p className="text-[13px] font-medium text-ink-2">3 · Name and logo</p>
              <Field label="School name" htmlFor="br-name" required>
                <Input id="br-name" value={name} onChange={e => setName(e.target.value)} disabled={!canEdit} maxLength={120} />
              </Field>
              <div className="flex flex-wrap items-center gap-3">
                <SchoolMark name={school} logo={logo} className="size-16 border border-line bg-surface" />
                {canEdit && (
                  <div className="flex flex-wrap gap-2">
                    <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only"
                           id="br-logo" onChange={e => pickFile(e.target.files?.[0])} />
                    <Button size="sm" onClick={() => file.current?.click()}><Upload className="size-4" aria-hidden /> {logo ? 'Replace' : 'Upload a logo'}</Button>
                    {logo && <Button size="sm" variant="ghost" onClick={() => setLogo(null)}><Trash2 className="size-4" aria-hidden /> Remove</Button>}
                  </div>
                )}
              </div>
              <p className="text-[12.5px] text-ink-3">
                {logoError ? <span role="alert" className="text-critical">{logoError}</span>
                  : `PNG, JPG, WebP or SVG. A square logo on a transparent background works best${t.dark ? ' — use a light version on the dark Urban style' : ''}. Without one, your initials are used.`}
              </p>
            </div>

            {save.error != null && <ErrorState error={save.error} />}
            {canEdit ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary" loading={save.isPending} disabled={!dirty || name.trim().length < 2} onClick={() => save.mutate()}>Save brand</Button>
                {(colour !== t.accent || second !== t.secondary) && (
                  <Button variant="ghost" onClick={() => { setColour(t.accent); setSecond(t.secondary); }}>Use {t.name}’s own colours</Button>
                )}
                {saved && <span role="status" className="flex items-center gap-1 text-[13px] text-positive"><Check className="size-4" aria-hidden /> Saved — everyone sees it now</span>}
              </div>
            ) : <p className="text-[12.5px] text-ink-3">Only the school’s owner can change its brand.</p>}
          </div>

          {/* What parents will see, before anyone else does. */}
          <figure aria-label="Preview" data-theme={theme} style={previewVars(t, colour, second)}
            className="overflow-hidden rounded-[28px] border-[6px] border-[#111] bg-canvas shadow-lg">
            <PhonePreview school={school} logo={logo} dark={t.dark} />
            <figcaption className="sr-only">Preview of the parent app with this style and these colours</figcaption>
          </figure>
        </div>
      </div>
    </Card>
  );
}

function HexField({ id, label, hint, value, onChange }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = React.useState(value.toUpperCase());
  React.useEffect(() => setText(value.toUpperCase()), [value]);
  const ok = !!normaliseHex(text);
  return (
    <div className="rounded-[var(--radius-md)] border border-line p-3">
      <label htmlFor={id} className="block text-[13px] font-medium">{label}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-md)] border border-line" style={{ background: value }} title="Choose visually">
          <input type="color" value={value} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`${label}: choose visually`}
                 onChange={e => onChange(e.target.value)} />
        </label>
        <Input id={id} value={text} className="tnum w-32 uppercase" spellCheck={false} autoComplete="off" maxLength={7}
               aria-invalid={!ok} onChange={e => { setText(e.target.value); const h = normaliseHex(e.target.value); if (h) onChange(h); }} />
      </div>
      <p className="mt-1.5 text-[12px]">{ok ? <span className="text-ink-3">{hint}</span>
        : <span role="alert" className="text-critical">Enter a hex code like #C2563C.</span>}</p>
    </div>
  );
}

/** A small, static sample of the app in a theme — for choosing between them. */
function MiniScreen({ school, logo, dark }: { school: string; logo: string | null; dark: boolean }) {
  return (
    <div className="h-40 overflow-hidden bg-canvas p-3"
         style={dark ? { background: 'radial-gradient(260px 160px at 100% 0%, color-mix(in srgb, var(--color-secondary) 45%, transparent), transparent 70%), var(--color-canvas)' } : undefined}>
      <div className="flex items-center gap-1.5">
        <SchoolMark name={school} logo={logo} className="size-5 text-[8px]" />
        <span className="truncate text-[10px] font-semibold text-ink">{school}</span>
      </div>
      <p className="font-display mt-2 text-[22px] leading-none text-ink">Hi Emma,</p>
      <div className="theme-hero mt-2 flex h-[52px] items-end justify-between rounded-[var(--radius-md)] p-2">
        <span className="text-[10px] font-semibold">Floorwork Foundations</span>
        <span className="grid size-5 place-items-center rounded-full bg-black/25"><Play className="size-2.5 fill-current" /></span>
      </div>
      <div className="mt-2 flex gap-1.5">
        <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-semibold text-on-accent">Classes</span>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] text-ink-2">Progress</span>
      </div>
    </div>
  );
}

/** The parent home screen, in the chosen style and colours. */
function PhonePreview({ school, logo, dark }: { school: string; logo: string | null; dark: boolean }) {
  return (
    <div className="flex h-[520px] flex-col bg-canvas text-ink"
         style={dark ? { background: 'radial-gradient(360px 260px at 100% 0%, color-mix(in srgb, var(--color-secondary) 45%, transparent), transparent 70%), var(--color-canvas)' } : undefined}>
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="flex items-center gap-2">
          <SchoolMark name={school} logo={logo} className="size-7 text-[10px]" />
          <span className="max-w-[140px] truncate text-[12px] font-semibold">{school}</span>
        </span>
        <Bell className="size-4 text-ink-2" aria-hidden />
      </div>
      <div className="flex-1 space-y-3 overflow-hidden px-4">
        <div>
          <p className="font-display text-[30px] leading-tight">Hi Emma,</p>
          <p className="text-[12px] text-ink-2">Ready to dance today?</p>
        </div>
        <div className="theme-hero relative h-28 overflow-hidden rounded-[var(--radius-lg)] p-3">
          <svg aria-hidden viewBox="0 0 200 100" className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
            {dark ? <path d="M-10 90 L120 -10 L150 -10 L20 90 Z" fill="white" />
              : <path d="M0 70 C 50 20, 100 110, 200 30 L200 100 L0 100 Z" fill="white" />}
          </svg>
          <span className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#111]"><Play className="size-4 fill-current" /></span>
          <span className="absolute bottom-2.5 left-3 text-[12px] font-semibold">Next: Grade 3 Ballet</span>
        </div>
        <div className="card p-3">
          <div className="flex items-center justify-between">
            <span><span className="block text-[11px] text-ink-3">This week</span><span className="block text-[13px] font-semibold">3 classes · 1 trial</span></span>
            <BarChart3 className="size-5 text-accent-text" aria-hidden />
          </div>
          <span className="mt-2 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-ink">94% attendance</span>
        </div>
        <span className="block rounded-[var(--radius-md)] bg-accent py-2.5 text-center text-[13px] font-semibold text-on-accent">Book a class</span>
      </div>
      <div className="flex border-t border-line bg-surface">
        {[[Home, 'Home', true], [CalendarDays, 'Schedule', false], [MessageSquare, 'Messages', false]].map(([I, l, on]) => {
          const Icon = I as React.ElementType;
          return <span key={l as string} className={cn('flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]', on ? 'text-accent-text' : 'text-ink-3')}>
            <Icon className="size-4" aria-hidden />{l as string}</span>;
        })}
      </div>
      <div className="bg-surface pb-2 text-center"><PoweredBy className="justify-center text-[9.5px]" /></div>
    </div>
  );
}
