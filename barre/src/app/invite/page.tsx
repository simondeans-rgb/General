'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { readAs, runAs } from '@/lib/db/client';
import { useSession, type Role } from '@/lib/auth/session';
import { SwayvoLogo } from '@/components/app/swayvo';
import { useSchoolTheme } from '@/components/app/brand';
import { Button, ErrorState, Field, Input, Notice, Skeleton } from '@/components/ui';

type Preview = { studio_name: string; role: Role; email: string; full_name: string | null;
  family_name: string | null; student_name: string | null; state: string;
  /** The family is one adult on their own (U12). */
  adult_only?: boolean };

const AS: Record<string, string> = {
  owner: 'the owner', admin: 'an administrator', teacher: 'a teacher', guardian: 'a parent', student: 'a student',
};
const HOME: Record<string, string> = {
  owner: '/onboarding', admin: '/today', teacher: '/teach', guardian: '/family', student: '/learn',
};
const PROBLEM: Record<string, string> = {
  accepted: 'This invitation has already been used. If it was you, just sign in.',
  revoked: 'This invitation was withdrawn. Ask the school for a new one.',
  expired: 'This invitation has expired. Ask the school to send a new link.',
  unavailable: 'This school is not taking new members at the moment.',
};

export default function InvitePage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><Invite /></Suspense>;
}

/**
 * Where an invitation link lands. In the live service the person first
 * creates their login (Supabase Auth), then accepts. This demo has no
 * passwords, so accepting creates the account and signs straight in — the
 * database side, app.accept_invitation, is identical.
 */
function Invite() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const { signIn } = useSession();
  const preview = useQuery({
    queryKey: ['invite-preview', token],
    queryFn: () => readAs<Preview>(null, `select * from app.invitation_preview($1)`, [token]),
    enabled: !!token,
  });
  const p = preview.data?.[0];
  // Swayvo's own page until the person is inside their school.
  useSchoolTheme(null);
  const [name, setName] = React.useState('');
  React.useEffect(() => { if (p?.full_name) setName(n => n || p.full_name!); }, [p]);

  const accept = useMutation({
    mutationFn: async () => {
      const me = crypto.randomUUID();
      const rows = await runAs({ userId: me, role: 'authenticated' },
        q => q<{ role: Role }>(`select * from app.accept_invitation($1, $2)`, [token, name.trim()]));
      return { me, role: rows[0]!.role };
    },
    onSuccess: ({ me, role }) => {
      signIn({ userId: me, role, name: name.trim() });
      router.replace(HOME[role] ?? '/');
    },
  });

  return (
    <main id="main" className="min-h-dvh bg-surface px-5 pb-12 pt-8 sm:px-8">
      <div className="mx-auto w-full max-w-md">
        <SwayvoLogo className="mb-10 h-7" />
        {!token && <Problem text="This link is missing its invitation code. Open the link exactly as it was sent." />}
        {token && preview.isLoading && <Skeleton className="h-32" />}
        {preview.error && <ErrorState error={preview.error} />}
        {token && preview.data && !p && <Problem text="This invitation link is not valid. Check it was copied in full." />}
        {p && p.state !== 'valid' && <Problem title={p.studio_name} text={PROBLEM[p.state] ?? 'This invitation cannot be used.'} />}
        {p && p.state === 'valid' && (
          <>
            <p className="label text-accent-text">Invitation</p>
            <h1 className="mt-1 font-display text-[1.875rem] font-[800] leading-[1.05] [font-stretch:112%]">Join {p.studio_name}</h1>
            <p className="mt-2 text-[0.9375rem] text-ink-2">
              {p.role === 'guardian' && p.adult_only
                ? `You’ve been invited to manage your own bookings at ${p.studio_name}: your classes, drop-ins and payments.`
                : <>You have been invited as {AS[p.role] ?? p.role}
                  {p.family_name ? ` in the ${p.family_name}` : ''}{p.student_name ? ` — a login for ${p.student_name}` : ''}.</>}
            </p>
            <div className="mt-6 space-y-4 border-t-2 border-ink pt-5">
              <Field label="Email" htmlFor="iv-email" hint="The invitation was sent to this address.">
                <Input id="iv-email" value={p.email} readOnly />
              </Field>
              <Field label="Your name" htmlFor="iv-name" required>
                <Input id="iv-name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </Field>
              {p.role === 'student' && (
                <p className="border-l-2 border-line-strong py-1 pl-3 text-[0.875rem] text-ink-2">
                  Your login works once a parent has approved it.
                </p>
              )}
              {accept.error && <ErrorState error={accept.error} />}
              <Button variant="primary" size="lg" className="w-full" loading={accept.isPending}
                      disabled={name.trim().length < 2} onClick={() => accept.mutate()}>
                Accept and join
              </Button>
              <p className="text-center text-[0.8125rem] text-ink-3">
                Demo: no password is needed here. In the live service you create your login first.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Problem({ title, text }: { title?: string; text: string }) {
  return (
    <div>
      <h1 className="sr-only">{title ?? 'Invitation'}</h1>
      <Notice word="Closed" tone="caution" title={title ?? 'Invitation'} detail={text} />
    </div>
  );
}
