import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ImageInfoDto } from '../models/imageInfoDto';
import { ImageCacheService } from '../services/imageCache.service';
import { ImagesHttpService } from '../services/imagesHttp.service';
import { copyToClipboard } from "../statics/copyToClipboard"
import { downloadFileQuery } from "../statics/downloadFileQuery"
import { dateFromUTC } from "../statics/dateFromUTC"
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../services/currentUser.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdProfileImageDeletingModalComponent } from '../modals/profileImageDeleting/ngbdProfileImageDeletingModal.component';
import { NgbdImageEditModalComponent } from '../modals/imageEdit/ngbdImageEditModal.component';
import { NgbdImageReportModalComponent } from '../modals/imageReport/ngbdImageReportModal.component';
import { TranslateService } from '@ngx-translate/core';
import { customReuseStrategyClear } from '../custom-reuse.strategy';

@Component({
    templateUrl: './images.component.html',
    providers: [
        ImagesHttpService
    ]
})
export class ImagesComponent {
    code: string;
    info: ImageInfoDto;
    infoUploadedDate: Date;
    imageResourceUrl: string;
    thumbnailResourceUrl: string;

    imageWidth: number;
    imageHeight: number;
    imageSize: number;

    countDownToDeleteSub: Subscription;
    countToDelete: number;

    isFirstPage: boolean = true;
    isPublicStateChanging: boolean;
    isPublicStateViewModel: boolean;
    isRequestedDownload: boolean;
    isRequestedOpen: boolean;

    paramSubscription: Subscription;
    urlSubscription: Subscription;

    get isAdminAccess() {
        return this.info.user?.id != null && this.currentUserService.currentUser?.id == this.info.user?.id
    }

    get isLoggined() {
        return this.currentUserService.currentUser != null;
    }

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private imageCache: ImageCacheService,
        private imagesService: ImagesHttpService,
        private currentUserService: CurrentUserService,
        public location: Location,
        private modalService: NgbModal,
        private toastrService: ToastrService,
        private translateService: TranslateService
    ) { 
        this.paramSubscription = this.activatedRoute.params.subscribe(param => 
        {
            this.code = param["code"];
            this.isFirstPage = (this.location.getState() as any).navigationId == 1;
            this.imageResourceUrl = null;
            this.info = null;
            this.thumbnailResourceUrl = null;
            this.imageHeight = null;
            this.imageWidth = null;
            this.isRequestedDownload = false;

            this.imagesService.getImageInfo(this.code).subscribe(
                data => {
                    if (data.success) {
                        this.info = data.data;
                        this.infoUploadedDate = dateFromUTC(data.data.uploadedTime);
                        this.isPublicStateViewModel = data.data.isPublic;
                        if (data.data.autoDeleteIn) {
                            this.countToDelete = dateFromUTC(data.data.autoDeleteIn).getTime() - new Date().getTime();
                            this.countDownToDeleteSub = timer(0, 1000).subscribe(
                                () => {
                                    this.countToDelete -= 1000;
                                    if (this.countToDelete <= 0)
                                        this.countDownToDeleteSub?.unsubscribe();
                                }
                            );
                        }
                        else {
                            this.countDownToDeleteSub = null;
                        }

                        this.loadThumbnail(data.data.imageCode);
                        this.loadImage(data.data.imageCode, data.data.imageType);
                    }
                },
                error => {
                    this.redirectNotFound();
                }
            )
        });
    }

    redirectNotFound() {
        this.router.navigateByUrl("/not-found", {
            skipLocationChange: true
        });
    }

    loadImage(code: string, ext: string) {
        this.imageCache.requestImageUsingCache(
            code, 
            code => this.imagesService.getImageBlob(code, ext)
        ).subscribe(
            url => {
                this.imageResourceUrl = url;
                this.get_filesize(url, size => {
                    this.imageSize = size
                });
                this.receiveImageData(url);

                if (this.isRequestedDownload) {
                    this.isRequestedDownload = false;
                    this.downloadImage();
                }

                if (this.isRequestedOpen) {
                    this.isRequestedOpen = false;
                    this.openInNewTab();
                }
            },
            (error: HttpErrorResponse) => {
                if (error.status == 401 || error.status == 403 || error.status == 404) {
                    this.redirectNotFound();
                } else {
                    setTimeout(() => this.loadImage(code, ext), 2000);
                }
            }
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

    loadThumbnail(code: string) {
        this.imageCache.requestThumbnailUsingCache(
            code,
            code => this.imagesService.getThumbnailBlob(code)
        ).subscribe(
            data => {
                this.thumbnailResourceUrl = data;
            }
        )
    }

    copyLink() {
        copyToClipboard(window.location.origin + "/i/" + this.info.imageCode);
        this.toastrService.info(this.translateService.instant("shared.linkCopied"));
    }

    copyDirectLink() {
        copyToClipboard(this.imagesService.getImageDirectLink(this.info.imageCode, this.info.imageType.replace("jpeg", "jpg")));
        this.toastrService.info(this.translateService.instant("shared.linkCopied"));
    }

    onIsPublicCbChanged(event) {
        this.isPublicStateChanging = true;
        this.imagesService.changePublicState(
            this.info.imageCode,
            this.isPublicStateViewModel
        ).subscribe(
            data => {
                this.info.isPublic = this.isPublicStateViewModel
            },
            error => {
                this.isPublicStateViewModel = this.info.isPublic
            }
        ).add(
            () => this.isPublicStateChanging = false
        );
    }

    performIsPublicCbChanged() {
        if (!this.isPublicStateChanging) {
            this.isPublicStateViewModel = !this.isPublicStateViewModel;
            this.onIsPublicCbChanged(null);
        }
    }

    downloadImage() {
        if (this.imageResourceUrl != null) {
            downloadFileQuery(
                this.imageResourceUrl, 
                (this.info.title ?? ("PicoShelter-" + this.info.imageCode)) + '.' + this.info.imageType.replace("jpeg", "jpg")
            );
        }
        else {
            this.isRequestedDownload = true;
        }
    }

    openInNewTab() {
        if (this.imageResourceUrl != null) {
            window.open(this.imageResourceUrl, "_blank");
        }
        else if (this.info?.isPublic == true) {
            window.open(this.imagesService.getImageDirectLink(this.info.imageCode, this.info.imageType), "_blank");
        }
        else {
            this.isRequestedOpen = true;
        }
    }

    editImage() {
        const modalRef = this.modalService.open(NgbdImageEditModalComponent, { centered: true });
        modalRef.componentInstance.imageInfoDto = this.info;
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.toastrService.success(this.translateService.instant("images.toastr.edited"));
                    this.reload();
                }
                else if (r == false) {
                    this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                    this.reload();
                }
            }
        )
    }

    deleteImage() {
        const modalRef = this.modalService.open(NgbdProfileImageDeletingModalComponent, { centered: true });
        modalRef.componentInstance.imageCodes = [this.code];
        modalRef.result.then(
            result => {
                const r = result as { success: number, failed: number };
                if (r.failed > 0) {
                    this.toastrService.error(this.translateService.instant("profile.images.deletingFailed", { count: r.failed }));
                }
                if (r.success > 0) {
                    this.toastrService.success(this.translateService.instant("profile.images.deletingSuccess", { count:r.success }));
                    
                    if (this.isFirstPage) {
                        this.redirectNotFound();
                    }
                    else {
                        customReuseStrategyClear();
                        this.location.back();
                    }
                }
            },
            rejected => {
                
            }
        )
    }

    submitReport() {
        const modalRef = this.modalService.open(NgbdImageReportModalComponent, { centered: true });
        modalRef.componentInstance.imageCode = this.info.imageCode;
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.toastrService.success("Image report was successfully submitted!");
                }
                else if (r == false) {
                    this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                }
            }
        )
    }

    reload() {
        const currentUrl = this.router.url;
        this.router.navigateByUrl("/not-found", { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(currentUrl);
        })
    }
}
