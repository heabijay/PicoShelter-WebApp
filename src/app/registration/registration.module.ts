import { NgModule } from '@angular/core';
import { RegistrationComponent } from "./registration.component"
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: RegistrationComponent }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        RegistrationComponent
    ],
    exports: [
        RouterModule
    ]
})
export class RegistrationModule {}