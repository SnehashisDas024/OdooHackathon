import { getPasswordStrength } from '../../utils/validators';
import { Check, X } from 'lucide-react';

export default function PasswordRulesHint({ password }) {
  const rules = getPasswordStrength(password);

  return (
    <ul className="flex flex-col gap-1.5 mt-1" aria-label="Password requirements">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className="flex items-center gap-2 text-xs transition-colors"
          style={{ color: rule.passed ? 'var(--status-present)' : 'var(--ink-muted)' }}
        >
          {rule.passed ? (
            <Check size={13} strokeWidth={2.5} />
          ) : (
            <X size={13} strokeWidth={2} />
          )}
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
