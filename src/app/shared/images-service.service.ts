import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Image } from '../models/image-interface';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  private apiUrl = 'https://api.unsplash.com/photos';
  private apiAccessKey = '6grJpWOQSO0T9Rxg9uNkzzsxFEeJO85KSKVbW3YI_QU';

  index = 0;

  constructor(private http: HttpClient) {}

  private extractImageEntities(rawData: any[]): Image[] {
    return rawData.map((image) => ({
      id: image.id,
      description: image.description || image.alt_description,
      imageUrl: image.urls.small,
      index: this.index++,
    }));
  }

  getPhotos(page: number, perPage: number): Observable<Image[]> {
    const url = `${this.apiUrl}?client_id=${this.apiAccessKey}&page=${page}&per_page=${perPage}`;
    return this.http
      .get<any[]>(url)
      .pipe(map((rawData) => this.extractImageEntities(rawData)));
  }
}
