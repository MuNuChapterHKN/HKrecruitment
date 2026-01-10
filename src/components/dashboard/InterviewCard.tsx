import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';

type Interviewer = {
  id: string;
  name: string;
  image: string | null;
};

type Interview = {
  startingFrom: Date;
  confirmed: boolean;
  meetingId: string | null;
};

type InterviewCardProps = {
  interview: Interview;
  interviewers?: Interviewer[];
  variant?: 'default' | 'compact';
};

export function InterviewCard({
  interview,
  interviewers = [],
  variant = 'default',
}: InterviewCardProps) {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const labelClass =
    variant === 'compact'
      ? 'font-semibold'
      : 'text-muted-foreground font-medium';

  return (
    <div
      className={
        variant === 'compact'
          ? 'rounded-lg border bg-muted/30 p-6'
          : 'rounded-lg border bg-muted/50 p-4'
      }
    >
      {variant === 'default' && (
        <h2 className="mb-3 text-lg font-semibold">Your Interview Details</h2>
      )}
      <div
        className={variant === 'compact' ? 'space-y-3' : 'space-y-2 text-sm'}
      >
        <div className="flex items-start gap-2">
          <span className={labelClass}>Date & Time:</span>
          <span>{formatDateTime(interview.startingFrom)}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className={labelClass}>Status:</span>
          <span
            className={
              interview.confirmed
                ? 'text-green-600 dark:text-green-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }
          >
            {interview.confirmed ? 'Confirmed' : 'Pending confirmation'}
          </span>
        </div>
        {interviewers.length > 0 && (
          <div className="flex items-start gap-2">
            <span className={labelClass}>Interviewers:</span>
            <div className="flex items-center gap-3">
              {interviewers.map((interviewer) => (
                <div key={interviewer.id} className="flex items-center gap-2">
                  <Avatar className="size-6">
                    {interviewer.image && (
                      <AvatarImage
                        src={interviewer.image}
                        alt={interviewer.name}
                      />
                    )}
                    <AvatarFallback className="text-xs">
                      {interviewer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{interviewer.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {interview.meetingId && (
          <div className="flex items-start gap-2">
            <span className={labelClass}>Meeting Link:</span>
            <a
              href={interview.meetingId}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Join interview
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
