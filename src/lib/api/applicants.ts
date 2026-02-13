import { Result, fromPromise } from 'neverthrow';

export type FileType = 'cv' | 'sp';

export interface UpdateFileResponse {
  success: boolean;
  fileId: string;
  fileType: FileType;
  oldFileId: string;
}

export async function updateApplicantFile(
  applicantId: string,
  file: File,
  fileType: FileType
): Promise<Result<UpdateFileResponse, Error>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  return fromPromise(
    fetch(`/api/applicants/${applicantId}/files`, {
      method: 'PATCH',
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update file');
      }
      return response.json();
    }),
    (error) => (error instanceof Error ? error : new Error(String(error)))
  );
}
