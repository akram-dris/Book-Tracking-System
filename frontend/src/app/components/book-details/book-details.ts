
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { GetBook } from '../../models/get-book.model';
import { environment } from '../../../environments/environment';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-book-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './book-details.html',
  styleUrls: ['./book-details.css']
})
export class BookDetailsComponent implements OnInit {
  book: GetBook | undefined;
  rootUrl = environment.rootUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookService.getBook(+id).subscribe(book => {
        this.book = book;
      });
    }
  }

  deleteBook(): void {
    if (this.book) {
      this.bookService.deleteBook(this.book.id).subscribe(() => {
        this.router.navigate(['/books']);
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
