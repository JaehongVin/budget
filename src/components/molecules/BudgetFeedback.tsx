import { CircleAlert } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';

interface BudgetFeedbackProps {
  message: string;
}

//* Figma DS/Budget feedback/Warning
export const BudgetFeedback = ({ message }: BudgetFeedbackProps) => (
  <p
    role="status"
    className="flex items-center gap-8 rounded-12 bg-negative-subtle p-12 font-bold text-12 text-negative"
  >
    <Icon icon={CircleAlert} size={18} />
    {message}
  </p>
);
