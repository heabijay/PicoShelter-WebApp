import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ImageInfoDto } from 'src/app/models/imageInfoDto';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';
import { dateFromUTC } from "../../statics/dateFromUTC";
import { AdminHttpService } from 'src/app/services/adminHttp.service';
import { ImageCacheService } from 'src/app/services/imageCache.service';
import { ProfilesHttpService } from 'src/app/services/profilesHttp.service';
import { ReportMessageModel } from '../models/reportMessageModel';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdConfirmModalComponent } from 'src/app/modals/confirm/ngbdConfirmModal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorType } from 'src/app/enum/errorType';
import { ErrorResponseDto } from 'src/app/models/errorResponseDto';

@Component({
    selector: 'app-apanel-reports-component',
    templateUrl: './reports.component.html',
    providers: [
        ProfilesHttpService
    ]
})
export class ReportsComponent {
    private _currentReportIndex = -1;
    private _isRequestedOpen: boolean = false;

    reports: ImageShortInfoDto[];
    total: number = -1;

    currentReportImageInfo?: ImageInfoDto; 
    currentReportImageUrl?: string;
    currentReportMessages?: ReportMessageModel[];

    isRemoveImageAction: boolean = false;

    isBanUserAction: boolean = false;
    banUserUntil: Date;
    banUserComment: string;

    get currentReport() {
        return this.currentReportIndex < this.reports.length ? this.reports[this.currentReportIndex] : null;
    }

    get currentReportIndex() {
        return this._currentReportIndex;
    }

    set currentReportIndex(value) {
        this._currentReportIndex = value;
        this.resetSelectedActions();
        this.loadReportInfoAsync(this.currentReport?.imageCode);
    }

    constructor(
        private adminService: AdminHttpService,
        private toastr: ToastrService,
        private translate: TranslateService,
        private imageCache: ImageCacheService,
        public sanitizer: DomSanitizer,
        public profilesService: ProfilesHttpService,
        private modal: NgbModal,
    ) { 
    }


    ngOnInit(): void {
        this.refreshReportsAsync();
    }


    openInNewTab() {
        if (this.currentReportImageUrl != null) {
            window.open(this.currentReportImageUrl, "_blank");
        }
        else {
            this._isRequestedOpen = true;
        }
    }

    _dateFromUTC(value): Date {
        return dateFromUTC(value);
    }

    gotoNext(): void {
        this.currentReportIndex++
        if (!this.currentReport) {
            this.refreshReportsAsync();
        }
    }

    resetSelectedActions() {
        this.isRemoveImageAction = false;
    }

    
    async refreshReportsAsync() {
        await this.loadReportsAsync();
        this.currentReportIndex = this.reports.length > 0 ? 0 : -1;
    }

    async loadReportsAsync() {
        try {
            const data = await this.adminService.getReports().toPromise();
            this.reports = data.data.data;
            this.total = data.data.totalCount;
        } catch (err) {
            this.toastr.error(this.translate.instant("shared.somethingWentWrong"));
            throw err;
        }
    }

    async loadReportInfoAsync(imageCode?: string) {
        this.currentReportImageInfo = null;
        this.currentReportMessages = null;
        this.currentReportImageUrl = null;

        if (imageCode) {
            try {
                const data = await this.adminService.getImageInfo(imageCode).toPromise();
                this.currentReportImageInfo = data.data;

                this.imageCache.requestImageUsingCache(
                    this.currentReportImageInfo.imageCode, 
                    code => this.adminService.getImageBlob(code, this.currentReportImageInfo.imageType))
                    .subscribe(url => {
                        this.currentReportImageUrl = url;
                        if (this._isRequestedOpen) {
                            this._isRequestedOpen = false;
                            this.openInNewTab();
                        }
                    });

                await this.loadReportDetailsAsync(this.currentReportImageInfo.imageId);
            } catch (err) {
                this.toastr.error(this.translate.instant("shared.somethingWentWrong"));
                throw err;
            }
        }
    }

    async loadReportDetailsAsync(imageId?: number) {
        this.currentReportMessages = null;

        if (imageId) {
            const data = await this.adminService.getReportMessages(imageId, 0, 100).toPromise();
            this.currentReportMessages = data.data.data;
        };
    }

    
    async processVerdictAsync() {
        const modalRef = this.modal.open(NgbdConfirmModalComponent, { centered: true });
        modalRef.componentInstance.text = "Are you sure?";
        if (!await modalRef.result) return;

        try {
            if (this.isRemoveImageAction) {
                await this.adminService.deleteImage(this.currentReportImageInfo.imageCode).toPromise();
                this.toastr.success("Image was successfully deleted!");
            }

            if (this.isBanUserAction) {
                console.log(this.banUserUntil);
                
                await this.adminService.postBanUser(this.currentReportImageInfo?.user?.id, this.banUserUntil, this.banUserComment).toPromise();
                this.toastr.success("User was successfully banned!");
            }

            await this.adminService.postReportProcessed(this.currentReportImageInfo.imageId).toPromise();

            this.toastr.success("Report was successfully processed!");
            this.reports = this.reports.length == 1 ? [] : this.reports.splice(this.currentReportIndex, 1);
            this.total--;
            this._currentReportIndex--;
            this.gotoNext();
        } catch (err) {
            if (err as HttpErrorResponse) {
                let error = err?.error as ErrorResponseDto;
                switch (ErrorType[error?.error?.type]) {
                    case ErrorType.ADMIN_BAN_DISALLOWED:
                        this.toastr.error("Ban admin user is disallowed.");
                        return;
                }
            }

            this.toastr.error(this.translate.instant("shared.somethingWentWrong"));
            throw err;
        }
    }
}
