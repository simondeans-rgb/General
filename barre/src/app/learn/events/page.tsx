'use client';
import { EventsView } from '@/components/app/events-view';
export default function StudentEvents() {
  return <EventsView allow={['student']} title="Events" />;
}
