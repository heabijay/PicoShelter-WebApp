import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CurrentUserService } from "../services/currentUser.service";
import { AdminHttpService } from "../services/adminHttp.service";
import { StatsModel } from "./models/statsModel";
import { TranslateService } from "@ngx-translate/core";
import { HttpErrorResponse } from "@angular/common/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbdConfirmModalComponent } from "../modals/confirm/ngbdConfirmModal.component";
import { ImageInfoDto } from "../models/imageInfoDto";
import { NgModel } from "@angular/forms";
import { dateFromUTC } from "../statics/dateFromUTC";
import { ImageCacheService } from "../services/imageCache.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    templateUrl: "./apanel.component.html",
    providers: [
        AdminHttpService
    ]
})
export class APanelComponent {
    isStatsLoading: boolean = true;
    isStatsError: boolean = false;
    stats: StatsModel;

    isImageInfoLoading: boolean = false;
    isRequestedOpen: boolean = false;
    imageCode: string;
    imageInfo: ImageInfoDto;
    imageResourceUrl: string;
    imageSize: number;
    imageHeight: number;
    imageWidth: number;
    isRequestedDownload: boolean = false;
    isImageDeleting: boolean = false;
    @ViewChild("codeInput") codeField : NgModel;

    get imageInfoUploadedDate() {
        return dateFromUTC(this.imageInfo.uploadedTime);
    }

    get imageInfoAutoDeleteDate() {
        return dateFromUTC(this.imageInfo.autoDeleteIn);
    }

    get sanitizedImageResourceUrl() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.imageResourceUrl);
    }

    constructor(
        public currentUserService: CurrentUserService, 
        private routerService : Router,
        private toastrService: ToastrService,
        private adminService: AdminHttpService,
        private modalService: NgbModal,
        private translateService: TranslateService,
        private imageCache: ImageCacheService,
        private sanitizer: DomSanitizer
    ) {

    }

    ngOnInit(): void {
        if (this.currentUserService.currentUser?.role != 'admin') {
            this.toastrService.error(this.translateService.instant("apanel.toastr.accesssForbidden"));
            this.routerService.navigateByUrl("/");
        }

        this.updateStats();
    }

    updateStats(changeStatsLoading = true) {
        if (changeStatsLoading)
            this.isStatsLoading = true;
        this.isStatsError = false;

        this.adminService.getStats().subscribe(
            data => {
                if (data.success) {
                    this.isStatsLoading = false;
                    this.stats = data.data;
                }
                else {
                    this.isStatsError = true;
                }
            },
            (error: HttpErrorResponse) => {
                if (error.status == 401 || error.status == 403) {
                    this.toastrService.error(this.translateService.instant("apanel.stats.toastr.accessForbidden"));
                }
                
                this.isStatsError = true;
            }
        ).add(
            () => this.isStatsLoading = false
        );
    }
    

    getImageInfo() {
        this.imageInfo = null;
        this.imageHeight = null;
        this.imageWidth = null;
        this.imageSize = null;
        this.imageResourceUrl = null;
        this.isImageInfoLoading = true;
        this.isRequestedDownload = false;
        this.isImageDeleting = false;
        this.adminService.getImageInfo(this.imageCode).subscribe(
            data => {
                this.imageInfo = data.data;

                this.loadImage(this.imageInfo.imageCode, this.imageInfo.imageType);
            },
            (e: HttpErrorResponse) => {
                switch (e.status) {
                    case 403:
                        this.codeField.control.setErrors({
                            'forbidden': true,
                        });
                        return;
                    case 404:
                        this.codeField.control.setErrors({
                            'notFound': true,
                        });
                        return;
                }

                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => this.isImageInfoLoading = false
        );
    }

    get_filesize(url : string, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (this.readyState == this.DONE) {
                callback(parseInt(xhr.getResponseHeader("Content-Length")));
            }
        };
        xhr.send();
    }

    receiveImageData(url: string) {
        const imgBox = document.createElement('img');
        imgBox.style.position = 'fixed';
        imgBox.style.left = '0';
        imgBox.style.top = '0';
        imgBox.style.opacity = '0';
        imgBox.src = url;
        document.body.appendChild(imgBox);
        imgBox.onload = (event) => {
            this.imageHeight = imgBox.height;
            this.imageWidth = imgBox.width;
            document.body.removeChild(imgBox);
        }
    }

    loadImage(code: string, ext: string) {
        this.imageCache.requestImageUsingCache(
            code, 
            code => this.adminService.getImageBlob(code, ext)
        ).subscribe(
            url => {
                if (code == this.imageInfo.imageCode) {
                    this.imageResourceUrl = url;
                    this.get_filesize(url, size => {
                        this.imageSize = size
                    });
                    this.receiveImageData(url);

                    if (this.isRequestedOpen) {
                        this.isRequestedOpen = false;
                        this.openInNewTab();
                    }
                }
            },
            (error: HttpErrorResponse) => {
                setTimeout(() => this.loadImage(code, ext), 2000);
            }
        );
    }

    openInNewTab() {
        if (this.imageResourceUrl != null) {
            window.open(this.imageResourceUrl, "_blank");
        }
        else {
            this.isRequestedOpen = true;
        }
    }

    
    deleteImage() {
        const modalRef = this.modalService.open(NgbdConfirmModalComponent, { centered: true });
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.isImageDeleting = true;
                    this.adminService.deleteImage(this.imageInfo.imageCode).subscribe(
                        data => {
                            this.toastrService.success(this.translateService.instant("apanel.images.toastr.successfullyDeleted"));
                            this.getImageInfo();
                        },
                        error => {
                            this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                        },
                    ).add(
                        () => this.isImageDeleting = false
                    )
                }
            },
            rejected => {

            }
        )
    }
}