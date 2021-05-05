import { NgModule } from '@angular/core';
import { AlbumsComponent } from "./albums.component"
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { NgbdAlbumAddImageModalComponent } from '../modals/albumAddImage/ngbdAlbumAddImageModal.component';
import { NgbdAlbumMembersModalComponent } from '../modals/albumMembers/ngbdAlbumMembersModal.component';

const routes: Routes = [
    { path: '', component: AlbumsComponent }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        AlbumsComponent,
        NgbdAlbumAddImageModalComponent,
        NgbdAlbumMembersModalComponent
    ],
    exports: [
        RouterModule
    ]
})
export class AlbumsModule {}