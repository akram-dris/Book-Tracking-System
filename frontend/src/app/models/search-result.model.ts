import { GetBook } from './get-book.model';
import { GetAuthor } from './get-author.model';
import { GetTag } from './get-tag.model';

export interface SearchResult {
    books: GetBook[];
    authors: GetAuthor[];
    tags: GetTag[];
}
