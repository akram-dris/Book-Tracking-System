
export interface GetTag {
    id: number;
    name: string;
    averageRating?: number;
    totalBooks: number;
    completedBooks: number;
    readingBooks: number;
    previewImageUrls: string[];
}
