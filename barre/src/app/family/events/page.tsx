'use client';
import { EventsView } from '@/components/app/events-view';
export default function ParentEvents() {
  return <EventsView allow={['guardian']} title="Events" />;
}
