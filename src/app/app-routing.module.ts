import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageGalleryComponent } from './image-gallery/image-gallery.component';

const routes: Routes = [  { path: 'image-gallery', component: ImageGalleryComponent },
{ path: '', redirectTo: '/image-gallery', pathMatch: 'full' },
{ path: '**', redirectTo: '/image-gallery' }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
