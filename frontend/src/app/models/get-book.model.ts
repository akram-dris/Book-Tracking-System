
import { GetAuthor } from './get-author.model';
import { GetTag } from './get-tag.model';

import { ReadingStatus } from './enums/reading-status.enum';

export interface GetBook {
    id: number;
    authorId: number;
    title: string;
    totalPages: number;
    imageUrl?: string;
    status: ReadingStatus; // Add status property
    startedReadingDate?: Date; // New property
    createdAt: Date;
    updatedAt: Date;
    author?: GetAuthor;
    tags?: GetTag[];
}
