import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { ProfilesComponent } from './profiles.component';
import { OverviewComponent } from './overview/overview.component';
import { AlbumsComponent } from './albums/albums.component';
import { ImagesComponent } from './images/images.component';
import { profileRoutes } from './profiles.routes';
import { ProfilesDataService } from './profiles.data.service';
import { NgbdAlbumCreateModalComponent } from '../modals/albumCreate/ngbdAlbumCreateModal.component';
import { NgbdProfileImageDeletingModalComponent } from '../modals/profileImageDeleting/ngbdProfileImageDeletingModal.component';

const routes: Routes = [
    { path: "", component: ProfilesComponent, children: profileRoutes },
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        ProfilesComponent,
        OverviewComponent,
        AlbumsComponent,
        ImagesComponent,
        NgbdAlbumCreateModalComponent,
        NgbdProfileImageDeletingModalComponent,
    ],
    providers: [
        ProfilesDataService
    ],
    exports: [
        RouterModule
    ]
})
export class ProfilesModule {}