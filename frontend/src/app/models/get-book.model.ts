
import { GetAuthor } from './get-author.model';
import { GetTag } from './get-tag.model';

export interface GetBook {
    id: number;
    authorId: number;
    title: string;
    totalPages: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    author?: GetAuthor;
    tags?: GetTag[];
}
