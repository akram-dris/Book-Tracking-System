export interface Recommendation {
    bookId: number;
    bookTitle: string;
    authorName: string | null;
    totalPages: number;
    imageUrl: string | null;
    recommendationReason: string;
    authorAverageRating: number | null;
    tagAverageRating: number | null;
    tags: string[];
}
