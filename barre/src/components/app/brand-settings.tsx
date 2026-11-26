'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Check, Info, Home, CalendarDays, MessageSquare, Bell, TrendingUp } from 'lucide-react';
import { useRows } from '@/lib/query';
import { runAs } from '@/lib/db/client';
import { useSession } from '@/lib/auth/session';
import { Button, ErrorState, Field, Input, Skeleton } from '@/components/ui';
import { SettingsSection as Card, SettingsHead as CardHeader } from './progress-settings';
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

  if (!current) return <Card><Skeleton className="h-40" /></Card>;
  const school = name || current.name;

  return (
    <Card id="brand">
      <CardHeader title="Your brand" subtitle="Choose a style, then make it yours with your colours and logo" />
      <div className="space-y-8 pt-4">
        {/* 1. The style */}
        <fieldset disabled={!canEdit}>
          <legend className="mb-2 text-[14px] font-semibold">1 · Style</legend>
          <div role="radiogroup" aria-label="Style" className="grid gap-3 sm:grid-cols-2">
            {(Object.values(THEMES) as Theme[]).map(th => {
              const on = th.id === theme;
              const a = on ? colour : th.accent, b = on ? second : th.secondary;
              return (
                <button key={th.id} type="button" role="radio" aria-checked={on} onClick={() => chooseTheme(th.id)}
                  className={cn('overflow-hidden rounded-[var(--radius-lg)] border-2 text-left',
                    on ? 'border-ink' : 'border-line hover:border-line-strong')}>
                  <div data-theme={th.id} style={previewVars(th, a, b)} className="pointer-events-none">
                    <MiniScreen school={school} logo={logo} dark={th.dark} />
                  </div>
                  <div className="flex items-start gap-2 bg-surface px-3 py-2.5">
                    <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border', on ? 'border-ink bg-ink text-ink-invert' : 'border-line-strong')}>
                      {on && <Check className="size-3" aria-hidden />}
                    </span>
                    <span><span className="block font-semibold">{th.name}</span><span className="block text-[13px] text-ink-3">{th.tagline}</span></span>
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
              <legend className="mb-1 text-[14px] font-semibold">2 · Colours</legend>
              <p className="mb-3 text-[13px] text-ink-3">Pick a pairing made for {t.name}, or enter the exact colours from your brand guidelines.</p>
              <div role="radiogroup" aria-label="Colour pairings" className="flex flex-wrap gap-2">
                {t.presets.map(p => {
                  const on = colour === p.accent && second === p.secondary;
                  return (
                    <button key={p.name} type="button" role="radio" aria-checked={on} title={p.name} aria-label={`${p.name}: ${p.accent.toUpperCase()} and ${p.secondary.toUpperCase()}`}
                      onClick={() => { setColour(p.accent); setSecond(p.secondary); }}
                      className={cn('flex min-h-10 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13px]', on ? 'border-ink ring-1 ring-ink font-semibold' : 'border-line-strong hover:border-ink-3')}>
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
                <HexField id="br-hex2" label="Second colour" hint={t.dark ? 'The downbeat, and highlights on dark screens' : 'The downbeat and small accents'} value={second} onChange={setSecond} />
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
              <p className="text-[14px] font-semibold">3 · Name and logo</p>
              <Field label="School name" htmlFor="br-name" required>
                <Input id="br-name" value={name} onChange={e => setName(e.target.value)} disabled={!canEdit} maxLength={120} />
              </Field>
              <div className="flex flex-wrap items-center gap-3">
                <SchoolMark name={school} logo={logo} className="size-16 border border-line bg-surface" />
                {canEdit && (
                  <div className="flex flex-wrap gap-2">
                    <input ref={file} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only"
                           id="br-logo" aria-label="Logo image file" tabIndex={-1} onChange={e => pickFile(e.target.files?.[0])} />
                    <Button size="sm" onClick={() => file.current?.click()}><Upload className="size-4" aria-hidden /> {logo ? 'Replace' : 'Upload a logo'}</Button>
                    {logo && <Button size="sm" variant="ghost" onClick={() => setLogo(null)}><Trash2 className="size-4" aria-hidden /> Remove</Button>}
                  </div>
                )}
              </div>
              <p className="text-[13px] text-ink-3">
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
            className="overflow-hidden rounded-[28px] border-[6px] border-ink bg-canvas shadow-md">
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
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink-2">{label}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <label className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-md)] border border-line" style={{ background: value }} title="Choose visually">
          <input type="color" value={value} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`${label}: choose visually`}
                 onChange={e => onChange(e.target.value)} />
        </label>
        <Input id={id} value={text} className="tnum w-32 uppercase" spellCheck={false} autoComplete="off" maxLength={7}
               aria-invalid={!ok} onChange={e => { setText(e.target.value); const h = normaliseHex(e.target.value); if (h) onChange(h); }} />
      </div>
      <p className="mt-1.5 text-[12.5px]">{ok ? <span className="text-ink-3">{hint}</span>
        : <span role="alert" className="text-critical">Enter a hex code like #C2563C.</span>}</p>
    </div>
  );
}

/** The count, in the school's colours: the downbeat in the second colour. */
function MiniCount({ h = 12, w = 3 }: { h?: number; w?: number }) {
  const tall = [100, 45, 45, 45, 75, 45, 45, 45];
  return (
    <span aria-hidden className="inline-flex items-end" style={{ height: h, gap: Math.max(1, w / 2) }}>
      {tall.map((v, i) => <span key={i} className={cn('block rounded-[1px]', i === 0 ? 'bg-secondary' : 'bg-accent')}
        style={{ width: w, height: `${v}%`, marginLeft: i === 4 ? w : 0 }} />)}
    </span>
  );
}

/** A small, static sample of the app in a style — for choosing between them. */
function MiniScreen({ school, logo }: { school: string; logo: string | null; dark: boolean }) {
  return (
    <div className="h-40 overflow-hidden bg-canvas p-3 text-ink">
      <div className="flex items-center gap-1.5">
        <SchoolMark name={school} logo={logo} className="size-5 text-[8px]" />
        <span className="truncate text-[10px] font-semibold">{school}</span>
      </div>
      <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.08em] text-accent-text">Next · Tuesday</p>
      <p className="display-xl text-[34px]">17:30</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-semibold">Grade 3 Ballet</span>
        <MiniCount h={9} w={2} />
      </div>
      <span className="mt-2 block rounded-[4px] bg-accent py-1 text-center text-[9px] font-semibold text-on-accent">Book a class</span>
    </div>
  );
}

/** The parent home screen, in the chosen style and colours, in the Swayvo look. */
function PhonePreview({ school, logo }: { school: string; logo: string | null; dark: boolean }) {
  return (
    <div className="flex h-[520px] flex-col bg-canvas text-ink">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="flex items-center gap-2">
          <SchoolMark name={school} logo={logo} className="size-7 text-[10px]" />
          <span className="max-w-[140px] truncate text-[12px] font-semibold">{school}</span>
        </span>
        <Bell className="size-4 text-ink-2" aria-hidden />
      </div>
      <div className="flex-1 space-y-4 overflow-hidden px-4 pt-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-text">Next · Emma · Tuesday</p>
          <p className="display-xl mt-0.5 text-[52px]">17:30</p>
          <p className="font-display text-[16px] font-[800] leading-tight [font-stretch:112%]">Grade 3 Ballet</p>
          <p className="text-[11px] text-ink-3">Miss Freya · Studio One</p>
        </div>
        <div className="border-t-2 border-ink pt-2">
          <p className="font-display text-[15px] uppercase leading-none tracking-[-0.01em] [font-stretch:80%]">Moved</p>
          <p className="mt-1 text-[11.5px] font-semibold leading-snug">Thursday Tap moves to Studio Two</p>
          <p className="text-[10.5px] text-ink-3">Same time, same teacher.</p>
        </div>
        <div className="border-t border-line pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold">Pliés</span>
            <MiniCount h={11} w={3} />
          </div>
          <p className="text-[10.5px] text-ink-3">Secure · from Miss Freya’s last feedback</p>
        </div>
        <span className="block rounded-[var(--radius-md)] bg-accent py-2.5 text-center text-[13px] font-semibold text-on-accent">Book a class</span>
      </div>
      <div className="flex border-t border-line bg-surface">
        {[[Home, 'Home', true], [CalendarDays, 'Schedule', false], [MessageSquare, 'Messages', false], [TrendingUp, 'Progress', false]].map(([I, l, on]) => {
          const Icon = I as React.ElementType;
          return <span key={l as string} className={cn('relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]', on ? 'font-semibold text-ink' : 'text-ink-3')}>
            {on && <span className="absolute top-0 h-0.5 w-5 bg-accent" />}
            <Icon className="size-4" aria-hidden />{l as string}</span>;
        })}
      </div>
      <div className="bg-surface pb-2 text-center"><PoweredBy className="justify-center text-[9.5px]" /></div>
    </div>
  );
}

const HERO_W = 1600;

/** A photo, cropped to a wide banner and compressed on the device. */
async function toHero(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error('Choose a JPG, PNG or WebP photo.');
  if (file.size > 15 * 1024 * 1024) throw new Error('That photo is over 15 MB. Choose a smaller one.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image(); i.onload = () => ok(i); i.onerror = () => fail(new Error('That file could not be read as an image.')); i.src = url;
    });
    const ratio = 16 / 7;
    let sw = img.naturalWidth, sh = Math.round(sw / ratio);
    if (sh > img.naturalHeight) { sh = img.naturalHeight; sw = Math.round(sh * ratio); }
    const sx = Math.round((img.naturalWidth - sw) / 2), sy = Math.round((img.naturalHeight - sh) / 2);
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(HERO_W, sw); canvas.height = Math.round(canvas.width / ratio);
    canvas.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    for (const q of [0.82, 0.72, 0.6, 0.5]) {
      const out = canvas.toDataURL('image/jpeg', q);
      if (out.length <= 690_000) return out;
    }
    throw new Error('That photo is too detailed to store. Try another.');
  } finally { URL.revokeObjectURL(url); }
}

type Imagery = { id: string; name: string; hero_url: string | null; logo_light_url: string | null; theme: string };
const IMAGERY = `select id, name, hero_url, logo_light_url, theme from studio order by created_at limit 1`;
const SAVE_IMAGERY = `update studio set hero_url = $2, logo_light_url = $3, updated_at = now() where id = $1 returning id`;

/** A hero photo and a light logo (R-060). If the photo shows children, check you have consent. */
export function ImagerySettings({ canEdit }: { canEdit: boolean }) {
  const { session } = useSession();
  const qc = useQueryClient();
  const s = useRows<Imagery>(['imagery'], IMAGERY).data?.[0];
  const [err, setErr] = React.useState<string | null>(null);
  const save = useMutation({
    mutationFn: (v: { hero: string | null; light: string | null }) => runAs(session, q => q(SAVE_IMAGERY, [s!.id, v.hero, v.light])),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['db'] }),
  });
  if (!s) return <Card><Skeleton className="h-24" /></Card>;
  const pick = (kind: 'hero' | 'light') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
    setErr(null);
    (kind === 'hero' ? toHero(f) : toLogo(f))
      .then(url => save.mutate(kind === 'hero' ? { hero: url, light: s.logo_light_url } : { hero: s.hero_url, light: url }))
      .catch(x => setErr((x as Error).message));
  };
  return (
    <Card>
      <CardHeader title="Photos" subtitle="A photo of your school for your public page and families’ home screen, and a light logo for dark screens." />
      <div className="grid gap-x-8 gap-y-6 pt-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[14px] font-semibold">Hero photo</p>
          {s.hero_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={s.hero_url} alt="Hero photo" className="aspect-[16/7] w-full rounded-[var(--radius-md)] object-cover" />
            : <div className="grid aspect-[16/7] place-items-center rounded-[var(--radius-md)] border border-dashed border-line-strong text-[12.5px] text-ink-3">No photo yet</div>}
          {canEdit && (
            <div className="flex gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-sm font-semibold hover:bg-surface-2 focus-within:ring-4 focus-within:ring-accent-line/12">
                <Upload className="size-4" aria-hidden /> {s.hero_url ? 'Replace' : 'Upload'}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={pick('hero')} />
              </label>
              {s.hero_url && <Button size="sm" variant="ghost" onClick={() => save.mutate({ hero: null, light: s.logo_light_url })}><Trash2 className="size-4" aria-hidden /> Remove</Button>}
            </div>
          )}
          <p className="text-[13px] text-ink-3">Cropped to a wide banner and compressed on this device. If it shows children, make sure their families agreed to photos.</p>
        </div>
        <div className="space-y-2">
          <p className="text-[14px] font-semibold">Light logo</p>
          <div data-theme="urban" className="grid h-24 place-items-center rounded-[var(--radius-md)] bg-canvas p-3">
            {s.logo_light_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={s.logo_light_url} alt="Light logo" className="max-h-16 object-contain" />
              : <span className="text-[13px] text-ink-3">No light logo</span>}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-sm font-semibold hover:bg-surface-2 focus-within:ring-4 focus-within:ring-accent-line/12">
                <Upload className="size-4" aria-hidden /> {s.logo_light_url ? 'Replace' : 'Upload'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={pick('light')} />
              </label>
              {s.logo_light_url && <Button size="sm" variant="ghost" onClick={() => save.mutate({ hero: s.hero_url, light: null })}><Trash2 className="size-4" aria-hidden /> Remove</Button>}
            </div>
          )}
          <p className="text-[13px] text-ink-3">Used with the Urban style{s.theme === 'urban' ? ' (your current style)' : ''}, where screens are dark.</p>
        </div>
        {(err || save.error != null) && <div className="sm:col-span-2"><ErrorState error={err ?? save.error} /></div>}
      </div>
    </Card>
  );
}
