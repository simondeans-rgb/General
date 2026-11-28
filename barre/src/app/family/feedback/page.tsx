'use client';
import { FeedbackView } from '@/components/app/feedback-view';
import { useFamilyVoice } from '@/components/app/adult-self';
export default function ParentFeedback() {
  // An adult student on their own reads their feedback as a student would (UR-21).
  const voice = useFamilyVoice();
  return voice.solo
    ? <FeedbackView allow={['guardian']} title="Your feedback" />
    : <FeedbackView allow={['guardian']} title="Feedback" showStudent />;
}
