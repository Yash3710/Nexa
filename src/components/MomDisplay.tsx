import { FileText, Target, MessageSquare, AlertTriangle, CheckSquare } from 'lucide-react';
import { MomJson } from '@/lib/types';
import { cn } from '@/lib/utils';

export function MomDisplay({ mom }: { mom: MomJson }) {
  return (
    <div className="space-y-6">
      <Section icon={FileText} title="Executive Summary">
        <p className="text-sm text-text-secondary leading-relaxed">{mom.executive_summary}</p>
      </Section>

      <Section icon={Target} title="Key Decisions">
        <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
          {mom.key_decisions.map((decision, i) => (
            <li key={i}>{decision}</li>
          ))}
        </ul>
      </Section>

      <Section icon={MessageSquare} title="Discussion Highlights">
        <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
          {mom.discussion_highlights.map((highlight, i) => (
            <li key={i}>{highlight}</li>
          ))}
        </ul>
      </Section>

      {mom.risks_and_concerns.length > 0 && (
        <Section icon={AlertTriangle} title="Risks & Concerns" iconColor="text-warning">
          <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
            {mom.risks_and_concerns.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section icon={CheckSquare} title="Next Steps">
        <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
          {mom.next_steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children, iconColor = "text-text-muted" }: { icon: any, title: string, children: React.ReactNode, iconColor?: string }) {
  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-lg p-5">
      <h3 className="text-md font-semibold text-text flex items-center space-x-2 mb-4">
        <Icon className={cn("w-5 h-5", iconColor)} />
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}
