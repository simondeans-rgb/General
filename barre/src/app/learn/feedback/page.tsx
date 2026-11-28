'use client';

import { FeedbackView } from '@/components/app/feedback-view';

export default function StudentFeedback() {
  return <FeedbackView allow={['student']} title="Your feedback" />;
}
