import { NgModule } from '@angular/core';
import { UploadComponent } from "./upload.component"
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { UploadExitGuard } from '../guards/upload.exit.guard';

const routes: Routes = [
    { path: '', component: UploadComponent, canDeactivate: [UploadExitGuard] }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        UploadComponent
    ],
    providers: [
        UploadExitGuard
    ],
    exports: [
        RouterModule
    ]
})
export class UploadModule {}