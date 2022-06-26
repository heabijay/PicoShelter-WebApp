import { NgModule } from '@angular/core';
import { APanelComponent } from "./apanel.component"
import { ReportsComponent } from "./reports/reports.component"
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', component: APanelComponent }
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        APanelComponent,
        ReportsComponent
    ],
    exports: [
        RouterModule
    ]
})
export class APanelModule {}