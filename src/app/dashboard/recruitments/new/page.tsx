'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createRecruitmentSession } from '@/lib/actions/recruitmentSessions';

export default function RecruitmentsNewPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createRecruitmentSession(formData);

      if (result.success) {
        router.push(`/dashboard/${result.id}`);
      } else {
        setError(result.error || 'Failed to create recruitment session');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-lg">
        <div className="rounded-lg border bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Recruitment Session
            </h1>
            <p className="text-muted-foreground mt-2">
              Set up a new recruitment session with dates and details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  type="number"
                  id="year"
                  name="year"
                  placeholder="2025"
                  min={2000}
                  max={3000}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  type="number"
                  id="semester"
                  name="semester"
                  placeholder="1"
                  min={1}
                  max={10}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input type="date" id="start_date" name="start_date" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input type="date" id="end_date" name="end_date" required />
              <p className="text-muted-foreground text-xs">
                Must be after start date
              </p>
            </div>

            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md p-2 hover:bg-muted">
                <svg
                  className="text-muted-foreground h-4 w-4 transition-transform group-open:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="text-sm font-medium">Advanced Options</span>
              </summary>
              <div className="mt-4 space-y-4 rounded-md border bg-muted/30 p-4">
                <p className="text-muted-foreground mb-3 text-xs">
                  Configure interview timeslot hours (defaults: 9:00 to 20:00)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="startHour">Start Hour</Label>
                    <Input
                      type="number"
                      id="startHour"
                      name="startHour"
                      placeholder="9"
                      min={0}
                      max={23}
                      defaultValue={9}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="endHour">End Hour</Label>
                    <Input
                      type="number"
                      id="endHour"
                      name="endHour"
                      placeholder="20"
                      min={0}
                      max={23}
                      defaultValue={20}
                    />
                  </div>
                </div>
              </div>
            </details>

            {error && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Session'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
