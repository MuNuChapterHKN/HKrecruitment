import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { applicant } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  uploadFile,
  shareFileWithDomain,
  getFileMetadata,
} from '@/lib/google/drive/files';
import { getApplicantById } from '@/lib/services/applicants';
import { auth } from '@/lib/server/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const form = await req.formData();

    const currentApplicant = await getApplicantById(id);
    if (!currentApplicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    const fileType = form.get('fileType') as 'cv' | 'sp' | null;
    const file = form.get('file') as File | null;

    if (!fileType || !file) {
      return NextResponse.json(
        { error: 'fileType and file are required' },
        { status: 422 }
      );
    }

    if (fileType !== 'cv' && fileType !== 'sp') {
      return NextResponse.json(
        { error: 'fileType must be either "cv" or "sp"' },
        { status: 422 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF document' },
        { status: 422 }
      );
    }

    const oldFileId =
      fileType === 'cv' ? currentApplicant.cvFileId : currentApplicant.spFileId;

    const oldFileMetadata = await getFileMetadata(oldFileId);
    if (oldFileMetadata.isErr()) {
      return NextResponse.json(
        { error: 'Could not retrieve existing file metadata' },
        { status: 500 }
      );
    }

    const parentFolderId = oldFileMetadata.value.parents?.[0];
    if (!parentFolderId) {
      return NextResponse.json(
        { error: 'Could not determine parent folder' },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString().split('.')[0].replace(/:/g, '-');
    const fileName =
      fileType === 'cv'
        ? `curriculum_${timestamp}.pdf`
        : `studypath_${timestamp}.pdf`;

    const uploadResult = await uploadFile({
      parentId: parentFolderId,
      file: {
        name: fileName,
        type: 'application/pdf',
        data: await file.arrayBuffer(),
      },
    });

    if (uploadResult.isErr()) {
      return NextResponse.json(
        { error: uploadResult.error.message },
        { status: 500 }
      );
    }

    const newFileId = uploadResult.value.id;

    const domain = process.env.GOOGLE_WORKSPACE_DOMAIN;
    if (domain) {
      await shareFileWithDomain(newFileId, domain);
    }

    const updateData =
      fileType === 'cv' ? { cvFileId: newFileId } : { spFileId: newFileId };

    await db.update(applicant).set(updateData).where(eq(applicant.id, id));

    return NextResponse.json(
      {
        success: true,
        fileId: newFileId,
        fileType,
        oldFileId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/applicants/[id]/files] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
