
import { CreateBook } from './create-book.model';

export interface UpdateBook extends CreateBook {
    id: number;
}
