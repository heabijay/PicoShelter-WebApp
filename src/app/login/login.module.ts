import { NgModule } from '@angular/core';
import { LoginComponent } from "./login.component"
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: LoginComponent }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        LoginComponent
    ],
    exports: [
        RouterModule
    ]
})
export class LoginModule {}