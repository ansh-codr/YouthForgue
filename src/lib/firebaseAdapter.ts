import { nanoid } from 'nanoid';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type UpdateData,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebaseClient';
import { uploadProjectMediaFile } from '@/src/lib/upload';
import {
  COMMENT_PAGE_SIZE,
  MODERATION_LOG_LIMIT,
  PROJECT_IMAGE_LIMIT,
  PROJECT_PAGE_SIZE,
} from '@/src/config/constants';
import type { ProjectMedia } from '@/src/types/media';
import type {
  CommentPage,
  CreateCommentInput,
  CreateProjectInput,
  ProjectComment,
  ProjectFeedQuery,
  ProjectFeedResponse,
  ProjectRecord,
  ProjectsAdapter,
  ProjectVisibility,
  ToggleLikeResult,
  UpdateProjectInput,
} from '@/src/types/project';

type ProjectDoc = DocumentData & {
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  visibility: ProjectVisibility;
  isFeatured: boolean;
  owner: ProjectRecord['owner'];
  media: ProjectMedia[];
  likesCount: number;
  commentsCount: number;
  likedByViewer?: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  deletedAt?: Timestamp;
  moderationLogs?: ProjectRecord['moderationLogs'];
};

const projectsCollection = (db: Firestore) => collection(db, 'projects');
const projectDoc = (db: Firestore, projectId: string) => doc(projectsCollection(db), projectId);
const likesCollection = (db: Firestore, projectId: string) => collection(projectDoc(db, projectId), 'likes');
const likeDoc = (db: Firestore, projectId: string, userId: string) => doc(likesCollection(db, projectId), userId);
const commentsCollectionRef = (db: Firestore, projectId: string) => collection(projectDoc(db, projectId), 'comments');

const toIso = (value?: Timestamp | string | null): string => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
};

const docToProject = (snap?: DocumentSnapshot<ProjectDoc>): ProjectRecord | null => {
  if (!snap || !snap.exists()) {
    return null;
  }
  const data = snap.data() as ProjectDoc;
  return {
    id: snap.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary,
    description: data.description,
    tags: data.tags ?? [],
    repoUrl: data.repoUrl,
    demoUrl: data.demoUrl,
    visibility: data.visibility,
    isFeatured: Boolean(data.isFeatured),
    owner: data.owner,
    media: data.media ?? [],
    likesCount: data.likesCount ?? 0,
    commentsCount: data.commentsCount ?? 0,
    likedByViewer: data.likedByViewer,
    createdAt: toIso(data.createdAt),
    updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
    deletedAt: data.deletedAt ? toIso(data.deletedAt) : undefined,
    moderationLogs: data.moderationLogs ?? [],
  };
};

const sanitizeModerationLogs = (logs?: ProjectRecord['moderationLogs']) =>
  (logs ?? []).slice(0, MODERATION_LOG_LIMIT);

const filesToMedia = async (
  projectId: string,
  files: File[],
  options?: { onProgress?: (payload: { fileName: string; progress: number }) => void }
): Promise<ProjectMedia[]> => {
  const safeFiles = files.slice(0, PROJECT_IMAGE_LIMIT);
  const uploads = await Promise.all(
    safeFiles.map((file) => uploadProjectMediaFile(projectId, file, { onProgress: options?.onProgress }))
  );
  return uploads.map((upload, index) => ({
    id: `media_${nanoid(8)}_${index}`,
    kind: 'image',
    alt: safeFiles[index]?.name ?? 'Project media',
    storagePath: upload.storagePath,
    downloadUrl: upload.downloadUrl,
    width: upload.width,
    height: upload.height,
    size: upload.size,
    contentType: upload.contentType,
    createdAt: new Date().toISOString(),
  }));
};

const getProjectSnapshot = async (db: Firestore, idOrSlug: string) => {
  const directSnap = await getDoc(projectDoc(db, idOrSlug));
  if (directSnap.exists()) {
    return directSnap;
  }
  const slugQuery = query(projectsCollection(db), where('slug', '==', idOrSlug), limit(1));
  const match = await getDocs(slugQuery);
  return match.docs[0];
};

const projectListener = (
  refOrQuery: DocumentReference | ReturnType<typeof query>,
  cb: (project: ProjectRecord | null) => void
): Unsubscribe =>
  onSnapshot(refOrQuery as any, (snapshot: any) => {
    if ('docs' in snapshot) {
      const docSnap = snapshot.docs[0] as DocumentSnapshot<ProjectDoc> | undefined;
      cb(docToProject(docSnap));
      return;
    }
    cb(docToProject(snapshot as DocumentSnapshot<ProjectDoc>));
  });

const commentSnapshotToRecord = (snap: QueryDocumentSnapshot<DocumentData>): ProjectComment => {
  const data = snap.data();
  return {
    id: snap.id,
    projectId: snap.ref.parent.parent?.id ?? '',
    body: data.body,
    author: data.author,
    parentId: data.parentId,
    createdAt: toIso(data.createdAt),
    updatedAt: data.updatedAt ? toIso(data.updatedAt) : undefined,
  };
};

const commentQuery = (
  db: Firestore,
  projectId: string,
  cursor?: string
) => {
  const base = [orderBy('createdAt', 'desc'), limit(COMMENT_PAGE_SIZE)] as QueryConstraint[];
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!Number.isNaN(cursorDate.getTime())) {
      base.push(startAfter(Timestamp.fromMillis(cursorDate.getTime())));
    }
  }
  return query(commentsCollectionRef(db, projectId), ...base);
};

const projectsQuery = async (db: Firestore, params: ProjectFeedQuery) => {
  const constraints: QueryConstraint[] = [];

  if (params.slug) {
    constraints.push(where('slug', '==', params.slug));
  }

  if (!params.slug) {
    const visibleStates: ProjectVisibility[] = ['public', 'unlisted'];
    constraints.push(where('visibility', 'in', visibleStates));
  }

  if (params.featuredOnly || params.sort === 'featured') {
    constraints.push(where('isFeatured', '==', true));
  }

  if (params.tag) {
    constraints.push(where('tags', 'array-contains', params.tag));
  }

  const sortField = params.sort === 'popular' ? 'likesCount' : 'createdAt';
  const sortDirection = 'desc';
  constraints.push(orderBy(sortField, sortDirection));
  if (sortField !== 'createdAt') {
    constraints.push(orderBy('createdAt', 'desc'));
  }
  const pageSize = Math.min(params.limit ?? PROJECT_PAGE_SIZE, PROJECT_PAGE_SIZE * 2);
  constraints.push(limit(pageSize));

  if (params.cursor) {
    const cursorSnap = await getDoc(projectDoc(db, params.cursor));
    if (cursorSnap.exists()) {
      constraints.push(startAfter(cursorSnap));
    }
  }

  return query(projectsCollection(db), ...constraints);
};

export const firebaseAdapter: ProjectsAdapter = {
  async createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    const db = getFirebaseDb();
    const ref = projectsCollection(db);
    const moderationLogs = sanitizeModerationLogs(input.moderationLogs);
    const payload = {
      slug: input.slug,
      title: input.title,
      summary: input.summary,
      description: input.description,
      tags: input.tags,
      repoUrl: input.repoUrl,
      demoUrl: input.demoUrl,
      visibility: input.visibility,
      isFeatured: Boolean(input.isFeatured),
      owner: input.owner,
      media: input.media,
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      moderationLogs,
    };

    let docRef: DocumentReference;
    if (input.projectId) {
      docRef = doc(ref, input.projectId);
      await setDoc(docRef, payload);
    } else {
      docRef = await addDoc(ref, payload);
    }

    const snapshot = await getDoc(docRef);
    const record = docToProject(snapshot as DocumentSnapshot<ProjectDoc>);
    if (!record) {
      throw new Error('Failed to create project');
    }
    return record;
  },

  async updateProject(input: UpdateProjectInput): Promise<ProjectRecord> {
    const db = getFirebaseDb();
    const ref = projectDoc(db, input.projectId);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        throw new Error('Project not found');
      }
      const data = snap.data() as ProjectDoc;
      const nextSlug = input.slug ?? data.slug;
      if (nextSlug !== data.slug) {
        const slugMatch = await getDocs(query(projectsCollection(db), where('slug', '==', nextSlug), limit(1)));
        if (!slugMatch.empty && slugMatch.docs[0]?.id !== snap.id) {
          throw new Error('Slug already in use');
        }
      }

      const updates: UpdateData<ProjectDoc> = {
        slug: nextSlug,
        title: input.title ?? data.title,
        summary: input.summary ?? data.summary,
        description: input.description ?? data.description,
        tags: input.tags ?? data.tags,
        repoUrl: input.repoUrl ?? data.repoUrl,
        demoUrl: input.demoUrl ?? data.demoUrl,
        visibility: input.visibility ?? data.visibility,
        media: input.media ?? data.media,
        isFeatured: typeof input.isFeatured === 'boolean' ? input.isFeatured : data.isFeatured,
        moderationLogs: input.moderationLogs ? sanitizeModerationLogs(input.moderationLogs) : data.moderationLogs,
        updatedAt: serverTimestamp(),
      };

      tx.update(ref, updates);
    });

    const snapshot = await getDoc(ref);
    const record = docToProject(snapshot as DocumentSnapshot<ProjectDoc>);
    if (!record) {
      throw new Error('Project not found after update');
    }
    return record;
  },

  async deleteProject(projectId: string): Promise<void> {
    const db = getFirebaseDb();
    await updateDoc(projectDoc(db, projectId), {
      visibility: 'deleted',
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async uploadProjectMedia(
    projectId: string,
    files: File[],
    options?: { onProgress?: (payload: { fileName: string; progress: number }) => void }
  ): Promise<ProjectMedia[]> {
    return filesToMedia(projectId, files, options);
  },

  async fetchProjectById(idOrSlug: string): Promise<ProjectRecord | null> {
    const db = getFirebaseDb();
    const snapshot = await getProjectSnapshot(db, idOrSlug);
    return docToProject(snapshot as DocumentSnapshot<ProjectDoc> | undefined);
  },

  listenProject(idOrSlug: string, cb: (project: ProjectRecord | null) => void): () => void {
    const db = getFirebaseDb();
    let cancelled = false;
    let activeUnsub: Unsubscribe | null = null;

    const cleanup = () => {
      cancelled = true;
      activeUnsub?.();
    };

    (async () => {
      const directRef = projectDoc(db, idOrSlug);
      const snap = await getDoc(directRef);
      if (cancelled) return;
      if (snap.exists()) {
        activeUnsub = projectListener(directRef, cb);
        return;
      }
      const slugQuery = query(projectsCollection(db), where('slug', '==', idOrSlug), limit(1));
      activeUnsub = projectListener(slugQuery, cb);
    })();

    return cleanup;
  },

  async fetchProjects(params: ProjectFeedQuery): Promise<ProjectFeedResponse> {
    const db = getFirebaseDb();
    if (params.slug) {
      const match = await this.fetchProjectById(params.slug);
      return { projects: match ? [match] : [], nextCursor: undefined };
    }

    const q = await projectsQuery(db, params);
    const snapshot = await getDocs(q);
    const projects = snapshot.docs
      .map((docSnap) => docToProject(docSnap as DocumentSnapshot<ProjectDoc>))
      .filter((record): record is ProjectRecord => Boolean(record));
    const pageSize = Math.min(params.limit ?? PROJECT_PAGE_SIZE, PROJECT_PAGE_SIZE * 2);
    const nextCursor = snapshot.size === pageSize ? snapshot.docs[snapshot.docs.length - 1]?.id : undefined;
    return { projects, nextCursor };
  },

  async createComment(projectId: string, input: CreateCommentInput): Promise<ProjectComment> {
    const db = getFirebaseDb();
    const commentsRef = commentsCollectionRef(db, projectId);
    const newComment = {
      body: input.body,
      author: input.author,
      parentId: input.parentId,
      createdAt: serverTimestamp(),
    };

    const commentDoc = await addDoc(commentsRef, newComment);
    await updateDoc(projectDoc(db, projectId), {
      commentsCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    const stored = await getDoc(commentDoc);
    return {
      id: stored.id,
      projectId,
      body: input.body,
      author: input.author,
      parentId: input.parentId,
      createdAt: stored.get('createdAt') instanceof Timestamp ? (stored.get('createdAt') as Timestamp).toDate().toISOString() : new Date().toISOString(),
    };
  },

  listenComments(projectId: string, cb: (page: CommentPage) => void, cursor?: string): () => void {
    const db = getFirebaseDb();
    const q = commentQuery(db, projectId, cursor);
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map((docSnap) => commentSnapshotToRecord(docSnap));
      const tail = snapshot.docs[snapshot.docs.length - 1];
      const nextCursor = snapshot.size === COMMENT_PAGE_SIZE && tail ? toIso(tail.get('createdAt')) : undefined;
      cb({ comments, nextCursor });
    });
  },

  async toggleLike(projectId: string, userId: string): Promise<ToggleLikeResult> {
    const db = getFirebaseDb();
    return runTransaction(db, async (tx) => {
      const projectRef = projectDoc(db, projectId);
      const likeRef = likeDoc(db, projectId, userId);
      const [projectSnap, likeSnap] = await Promise.all([tx.get(projectRef), tx.get(likeRef)]);
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }
      const currentCount = (projectSnap.data() as ProjectDoc).likesCount ?? 0;
      let nextCount = currentCount;
      if (likeSnap.exists()) {
        tx.delete(likeRef);
        nextCount = Math.max(0, currentCount - 1);
        tx.update(projectRef, { likesCount: nextCount, updatedAt: serverTimestamp() });
        return { liked: false, likesCount: nextCount } as ToggleLikeResult;
      }
      tx.set(likeRef, { createdAt: serverTimestamp() });
      nextCount = currentCount + 1;
      tx.update(projectRef, { likesCount: nextCount, updatedAt: serverTimestamp() });
      return { liked: true, likesCount: nextCount } as ToggleLikeResult;
    });
  },
};
