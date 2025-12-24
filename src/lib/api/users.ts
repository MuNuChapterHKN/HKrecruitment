import { Result, fromPromise } from 'neverthrow';

export async function fetchAvailableInterviewers(
  interviewId: string
): Promise<Result<Array<{ id: string; name: string }>, Error>> {
  return fromPromise(
    fetch(`/api/users/available/interview/${interviewId}`).then(
      async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch available users');
        }
        return response.json();
      }
    ),
    (error) => (error instanceof Error ? error : new Error(String(error)))
  );
}
