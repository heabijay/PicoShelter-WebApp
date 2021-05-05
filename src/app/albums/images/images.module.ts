import { NgModule } from '@angular/core';
import { ImagesComponent } from "./images.component"
import { SharedModule } from '../../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { NgbdAlbumImageLinksModalComponent } from 'src/app/modals/albumImageLinks/ngbdAlbumImageLinksModal.component';

const routes: Routes = [
    { path: '', component: ImagesComponent }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        PinchZoomModule
    ],
    declarations: [
        ImagesComponent,
        NgbdAlbumImageLinksModalComponent,
    ],
    exports: [
        RouterModule
    ]
})
export class ImagesModule {}