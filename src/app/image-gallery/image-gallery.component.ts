import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ImagesService } from '../shared/images-service.service';
import {
  BehaviorSubject,
  Observable,
  scan,
  map,
  switchMap,
  timer,
  filter,
  catchError,
  of,
} from 'rxjs';
import { Image } from '../models/image-interface';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
})
export class ImageGalleryComponent implements OnInit {
  private currentPageSubject = new BehaviorSubject<number>(1);
  currentPage$ = this.currentPageSubject.asObservable();
  perPage: number = 20;

  private buffer: Image[][] = [];
  bufferLimit = 2;

  loading: boolean = false;

  private scrollDirection: 'up' | 'down' = 'down';

  private firstBatchHalf: Image | null = null;
  private secondBatchHalf: Image | null = null;

  screenSize!: number;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = window.innerWidth;
  }

  images$: Observable<Image[]> = this.currentPage$.pipe(
    filter(() => !this.loading),
    switchMap((page) => this.loadImages(page)),
    catchError((error) => {
      console.error('Error loading the images', error);
      this.loading = false;
      return of([]);
    }),
    scan((_, images: Image[]) => {
      return this.handleScrollEvents(images);
    }, [] as Image[]),
    switchMap(() => timer(500)),
    map(() => {
      this.loading = false;
      this.toggleScroll('');
      return this.buffer.reduce((prev, curr) => [...prev, ...curr], []);
    })
  );

  constructor(
    private imagesService: ImagesService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenSize = window.innerWidth;
    }
  }

  private loadImages(page: number) {
    this.loading = true;
    this.toggleScroll('hidden');
    return this.imagesService.getPhotos(page, this.perPage);
  }

  private handleScrollEvents(images: Image[]) {
    if (this.scrollDirection === 'down') {
      this.buffer.push(images);
    } else if (this.scrollDirection === 'up') {
      this.buffer.unshift(images);
      this.buffer.pop();
    }

    this.buffer = this.buffer.slice(-this.bufferLimit);
    const finalList = this.buffer.reduce(
      (prev, curr) => [...prev, ...curr],
      []
    );

    this.setScrollReferences();

    console.log('List size:', finalList.length);

    return finalList;
  }

  private setScrollReferences() {
    if (this.scrollDirection === 'down') {
      if (this.buffer.length >= 2 && this.buffer[0]) {
        this.firstBatchHalf = this.buffer[0][8];
      }
    }

    if (this.scrollDirection === 'up') {
      if (this.buffer.length >= 2 && this.buffer[1]) {
        this.secondBatchHalf = this.buffer[1][0];
      }
    }
  }

  private scrollToReference(image: Image): void {
    if (image) {
      const imageElement = this.document.getElementById(`image-${image!.id}`);
      imageElement?.scrollIntoView({ block: 'start' });
    }
  }

  private toggleScroll(option: 'hidden' | ''): void {
    this.document.body.style.overflow = option;
  }

  onScrollDown(): void {
    this.scrollDirection = 'down';
    this.currentPageSubject.next(this.currentPageSubject.value + 1);
    this.scrollToReference(this.firstBatchHalf!);
  }

  onScrollUp(): void {
    this.scrollDirection = 'up';
    if (this.currentPageSubject.value >= 2) {
      this.currentPageSubject.next(this.currentPageSubject.value - 1);
    }
    this.scrollToReference(this.secondBatchHalf!);
  }
}
