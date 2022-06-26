import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileSizePipe } from '../pipes/fileSizePipe';
import { FormatTimePipe } from '../pipes/formatTimePipe';
import { ComparePasswordDirective } from '../directives/compare-password.directive';
import { NgbdConfirmModalComponent } from '../modals/confirm/ngbdConfirmModal.component';
import { NgbdImageEditModalComponent } from '../modals/imageEdit/ngbdImageEditModal.component';
import { ImageCacheService } from '../services/imageCache.service';
import { CurrentUserService } from '../services/currentUser.service';
import { TokenService } from '../services/token.service';
import { NgbdImageReportModalComponent } from '../modals/imageReport/ngbdImageReportModal.component';

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        ToastrModule,
        NgbModule
    ],
    declarations: [
        FileSizePipe,
        FormatTimePipe,
        ComparePasswordDirective,
        NgbdConfirmModalComponent,
        NgbdImageEditModalComponent,
        NgbdImageReportModalComponent
    ],
    exports: [
        RouterModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        ToastrModule,
        NgbModule,
        FileSizePipe,
        FormatTimePipe,
        ComparePasswordDirective,
        NgbdConfirmModalComponent,
        NgbdImageEditModalComponent,
        NgbdImageReportModalComponent
    ],
    providers: [
        TokenService,
        CurrentUserService,
        ImageCacheService
    ]
})
export class SharedModule {}