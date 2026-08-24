'use client';
import { FeedbackView } from '@/app/learn/feedback/page';
export default function ParentFeedback() {
  return <FeedbackView allow={['guardian']} title="Feedback" showStudent />;
}
