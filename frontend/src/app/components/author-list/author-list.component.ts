
import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../../services/author.service';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GetAuthor } from '../../models/get-author.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './author-list.component.html',
  styleUrls: ['./author-list.component.css']
})
export class AuthorListComponent implements OnInit {
  authors: GetAuthor[] = [];
  rootUrl: string = environment.rootUrl;

  constructor(private authorService: AuthorService) { }

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    this.authorService.getAuthors().subscribe(data => {
      this.authors = data;
      console.log('Authors:', data);
    });
  }

  deleteAuthor(id: number): void {
    this.authorService.deleteAuthor(id).subscribe(() => {
      this.loadAuthors();
    });
  }
}
