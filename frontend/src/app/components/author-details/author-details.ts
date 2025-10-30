
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorService } from '../../services/author.service';
import { GetAuthor } from '../../models/get-author.model';
import { environment } from '../../../environments/environment';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-author-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './author-details.html',
  styleUrls: ['./author-details.css']
})
export class AuthorDetailsComponent implements OnInit {
  author: GetAuthor | undefined;
  rootUrl = environment.rootUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authorService: AuthorService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.authorService.getAuthor(+id).subscribe(author => {
        this.author = author;
      });
    }
  }

  deleteAuthor(): void {
    if (this.author) {
      this.authorService.deleteAuthor(this.author.id).subscribe(() => {
        this.router.navigate(['/authors']);
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
