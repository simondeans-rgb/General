'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { readAs, runAs } from '@/lib/db/client';
import { useSession, type Role } from '@/lib/auth/session';
import { SwayvoIcon } from '@/components/app/swayvo';
import { Button, Card, ErrorState, Field, Input, Skeleton } from '@/components/ui';

type Preview = { studio_name: string; role: Role; email: string; full_name: string | null;
  family_name: string | null; student_name: string | null; state: string };

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
    <main className="grid min-h-dvh place-items-center bg-surface-2 p-4">
      <Card className="w-full max-w-md p-6">
        <SwayvoIcon className="mb-4 size-10" />
        {!token && <Problem text="This link is missing its invitation code. Open the link exactly as it was sent." />}
        {token && preview.isLoading && <Skeleton className="h-32" />}
        {preview.error && <ErrorState error={preview.error} />}
        {token && preview.data && !p && <Problem text="This invitation link is not valid. Check it was copied in full." />}
        {p && p.state !== 'valid' && <Problem title={p.studio_name} text={PROBLEM[p.state] ?? 'This invitation cannot be used.'} />}
        {p && p.state === 'valid' && (
          <>
            <h1 className="text-[22px] font-semibold tracking-tight">Join {p.studio_name}</h1>
            <p className="mt-1 text-sm text-ink-2">
              You have been invited as {AS[p.role] ?? p.role}
              {p.family_name ? ` in the ${p.family_name}` : ''}{p.student_name ? ` — a login for ${p.student_name}` : ''}.
            </p>
            <div className="mt-5 space-y-3">
              <Field label="Email" htmlFor="iv-email" hint="The invitation was sent to this address.">
                <Input id="iv-email" value={p.email} readOnly />
              </Field>
              <Field label="Your name" htmlFor="iv-name" required>
                <Input id="iv-name" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </Field>
              {p.role === 'student' && (
                <p className="rounded-[var(--radius-md)] bg-surface-2 p-3 text-[13px] text-ink-2">
                  Your login works once a parent has approved it.
                </p>
              )}
              {accept.error && <ErrorState error={accept.error} />}
              <Button variant="primary" size="lg" className="w-full" loading={accept.isPending}
                      disabled={name.trim().length < 2} onClick={() => accept.mutate()}>
                <CheckCircle2 className="size-4" aria-hidden /> Accept and join
              </Button>
              <p className="text-center text-[12px] text-ink-3">
                Demo: no password is needed here. In the live service you create your login first.
              </p>
            </div>
          </>
        )}
      </Card>
    </main>
  );
}

function Problem({ title, text }: { title?: string; text: string }) {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-[19px] font-semibold"><AlertTriangle className="size-5 text-caution" aria-hidden />
        {title ?? 'Invitation'}</h1>
      <p className="mt-2 text-sm text-ink-2">{text}</p>
    </div>
  );
}
