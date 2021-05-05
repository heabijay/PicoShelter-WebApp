import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AppsComponent } from './apps.component';

const routes: Routes = [
    { path: '', component: AppsComponent }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        AppsComponent
    ],
    exports: [
        RouterModule
    ]
})
export class AppsModule {}