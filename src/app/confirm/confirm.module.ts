import { NgModule } from '@angular/core';
import { ConfirmComponent } from "./confirm.component"
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: ConfirmComponent }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        ConfirmComponent
    ],
    exports: [
        RouterModule
    ]
})
export class ConfirmModule {}