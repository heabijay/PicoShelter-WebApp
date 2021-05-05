import { NgModule } from '@angular/core';
import { AboutComponent } from "./about.component"
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: AboutComponent }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        AboutComponent
    ],
    exports: [
        RouterModule
    ]
})
export class AboutModule {}