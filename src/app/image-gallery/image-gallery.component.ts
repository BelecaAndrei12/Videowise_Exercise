import { Component, HostListener, OnInit } from '@angular/core';
import { ImagesService } from '../shared/images-service.service';
import { Observable, debounceTime, map, tap } from 'rxjs';
import { Image } from '../models/image-interface';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss'
})
export class ImageGalleryComponent implements OnInit{

  images$:Observable<Image[]> = new Observable<Image[]>();
  prevBatch$: Observable<Image[]> = new Observable<Image[]>();

  currentPage: number = 1;
  perPage: number = 20;

  loadNewBatch = false;

  constructor(private imagesService:ImagesService) {}

  ngOnInit(): void {
      this.images$ = this.imagesService.getPhotos(this.currentPage, this.perPage);
      this.images$.subscribe(res => console.log(res))
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    if (!this.loadNewBatch) {
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      const totalHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const threshold = 100;

      const isAtBottom = scrollPosition + windowHeight + threshold >= totalHeight;

      if (isAtBottom) {
        this.loadNextBatch();
      }
    }
  }

  loadNextBatch() {
    this.loadNewBatch= true;
    this.currentPage++;


    this.prevBatch$ = this.images$.pipe(
      map(images => [...images])
    );
    this.images$ = this.imagesService.getPhotos(this.currentPage, this.perPage)
    .pipe(
      tap(() => this.loadNewBatch = false),
      debounceTime(1000)
    )
  }
}
