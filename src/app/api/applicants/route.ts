import { NextResponse } from 'next/server';
import { db } from '@/db';
import { applicant, DEGREE_LEVELS, LANGUAGE_LEVELS, STAGES } from '@/db/schema';
import { insertApplicantSchema } from '@/lib/services/applicants';
import { getFolderByName, createFolder } from '@/lib/google/drive/folders';
import { uploadFile, shareFileWithDomain } from '@/lib/google/drive/files';
import { ZodError } from 'zod';
import { findLatest } from '@/lib/services/recruitmentSessions';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const recruiting = await findLatest();

    if (!recruiting) {
      return NextResponse.json(
        { error: 'No recruiting session found' },
        { status: 400 }
      );
    }

    const now = new Date();
    const isValidWindow =
      now >= recruiting.start_date && now <= recruiting.end_date;

    if (!isValidWindow)
      return NextResponse.json(
        {
          error:
            'Applications are closed. Please apply during the next recruiting session.',
          session: {
            start_date: recruiting.start_date,
            end_date: recruiting.end_date,
          },
        },
        { status: 403 }
      );

    const cvFile = form.get('cvFile') as File | null;
    const spFile = form.get('spFile') as File | null;

    if (!cvFile || !spFile) {
      return NextResponse.json(
        { error: 'CV file and StudyPath file are required.' },
        { status: 422 }
      );
    }

    const data = {
      name: form.get('name')?.toString(),
      surname: form.get('surname')?.toString(),
      email: form.get('email')?.toString(),
      gpa: Number(form.get('gpa')),
      degreeLevel: form.get('degreeLevel')?.toString(),
      course: form.get('course')?.toString(),
      courseArea: form.get('courseArea')?.toString(),
      italianLevel: form.get('italianLevel')?.toString(),
    };

    const parsed = insertApplicantSchema.parse(data);

    const toInsert = {
      id: nanoid(),
      recruitingSessionId: recruiting.id,
      name: parsed.name,
      surname: parsed.surname,
      email: parsed.email,
      gpa: parsed.gpa.toString(),
      degreeLevel: parsed.degreeLevel as (typeof DEGREE_LEVELS)[number],
      course: parsed.course,
      courseArea: parsed.courseArea,
      italianLevel: parsed.italianLevel as (typeof LANGUAGE_LEVELS)[number],
      stage: 'a' as (typeof STAGES)[number],
      cvFileId: '',
      spFileId: '',
    };

    if (
      cvFile.type !== 'application/pdf' ||
      spFile.type !== 'application/pdf'
    ) {
      return NextResponse.json(
        { error: 'CV file and SP file must be PDF documents.' },
        { status: 422 }
      );
    }

    const ROOT = process.env.CANDIDATES_DIR_ID!;
    const baseFolderName = `${parsed.surname} ${parsed.name}`;

    const existingFolderResult = await getFolderByName(baseFolderName, ROOT);
    if (existingFolderResult.isErr()) {
      return NextResponse.json(
        { error: existingFolderResult.error.message },
        { status: 500 }
      );
    }

    let folderName = baseFolderName;
    if (existingFolderResult.value) {
      folderName = `${folderName} - ${toInsert.id}`;
    }

    const folderResult = await createFolder({
      name: folderName,
      parentId: ROOT,
    });

    if (folderResult.isErr()) {
      return NextResponse.json(
        { error: folderResult.error.message },
        { status: 500 }
      );
    }

    const folderId = folderResult.value.id;

    const cvUploadResult = await uploadFile({
      parentId: folderId,
      file: {
        name: 'curriculum.pdf',
        type: 'application/pdf',
        data: await cvFile.arrayBuffer(),
      },
    });

    if (cvUploadResult.isErr()) {
      return NextResponse.json(
        { error: cvUploadResult.error.message },
        { status: 500 }
      );
    }

    const spUploadResult = await uploadFile({
      parentId: folderId,
      file: {
        name: 'studypath.pdf',
        type: 'application/pdf',
        data: await spFile.arrayBuffer(),
      },
    });

    if (spUploadResult.isErr()) {
      return NextResponse.json(
        { error: spUploadResult.error.message },
        { status: 500 }
      );
    }

    const infoTxt = JSON.stringify(parsed, null, 2);
    const infoUploadResult = await uploadFile({
      parentId: folderId,
      file: {
        name: 'info.txt',
        type: 'text/plain',
        data: new TextEncoder().encode(infoTxt).buffer,
      },
    });

    if (infoUploadResult.isErr()) {
      return NextResponse.json(
        { error: infoUploadResult.error.message },
        { status: 500 }
      );
    }

    toInsert.cvFileId = cvUploadResult.value.id;
    toInsert.spFileId = spUploadResult.value.id;

    const domain = process.env.GOOGLE_WORKSPACE_DOMAIN;
    if (domain) {
      await shareFileWithDomain(cvUploadResult.value.id, domain);
      await shareFileWithDomain(spUploadResult.value.id, domain);
      await shareFileWithDomain(infoUploadResult.value.id, domain);
    }

    const inserted = await db.insert(applicant).values([toInsert]).returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    if (error instanceof ZodError && 'issues' in (error as any)) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('[POST /api/applicants] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
