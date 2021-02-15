import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ImageInfoDto } from '../models/imageInfoDto';
import { ImageCacheService } from '../services/imageCacheService';
import { ImagesHttpService } from '../services/imagesHttpService';
import { copyToClipboard } from "../static/copyToClipboard"
import { downloadFileQuery } from "../static/downloadFileQuery"
import { dateFromUTС } from "../static/dateFromUTC"
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../services/currentUserService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdProfileImageDeletingModalComponent } from '../modals/profileImageDeleting/NgbdProfileImageDeletingModal.component';
import { ImageEditDto } from '../models/imageEditDto';
import { NgbdImageEditModalComponent } from '../modals/imageEdit/ngbdImageEditModal.component';

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

    paramSubscription: Subscription;
    urlSubscription: Subscription;

    get isAdminAccess() {
        return this.currentUserService.currentUser?.id == this.info.user?.id
    }

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private imageCache: ImageCacheService,
        private imagesService: ImagesHttpService,
        private currentUserService: CurrentUserService,
        public location: Location,
        private modalService: NgbModal,
        private toastrService: ToastrService
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
                        this.infoUploadedDate = dateFromUTС(data.data.uploadedTime);
                        this.isPublicStateViewModel = data.data.isPublic;
                        if (data.data.autoDeleteIn) {
                            this.countToDelete = dateFromUTС(data.data.autoDeleteIn).getTime() - new Date().getTime();
                            this.countDownToDeleteSub = timer(0, 1000).subscribe(
                                () => this.countToDelete -= 1000
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
        this.imagesService.getImageBlob(code, ext).subscribe(
            blob => {
                const url = URL.createObjectURL(blob);
                this.imageResourceUrl = url;
                this.imageSize = blob.size;
                this.receiveImageData(url);

                if (this.isRequestedDownload)
                {
                    this.isRequestedDownload = false;
                    this.downloadImage();
                }
            },
            (error: HttpErrorResponse) => {
                if (error.status == 401 || error.status == 403 || error.status == 404) {
                    this.redirectNotFound();
                } else {
                    setTimeout(() => this.loadImage(code, ext), 2000);
                }
            }
        )
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
        this.toastrService.info("Link copied to clipboard!");
    }

    copyDirectLink() {
        copyToClipboard(this.imagesService.getImageDirectLink(this.info.imageCode, this.info.imageType.replace("jpeg", "jpg")));
        this.toastrService.info("Direct link copied to clipboard!");
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

    editImage() {
        const modalRef = this.modalService.open(NgbdImageEditModalComponent, { centered: true });
        modalRef.componentInstance.imageInfoDto = this.info;
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.toastrService.success("Image successfully edited!");
                    this.reload();
                }
                else if (r == false) {
                    this.toastrService.error("Something went wrong while image editing :(");
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
                    this.toastrService.error(r.failed + " image(s) wasn't deleted due error.");
                }
                if (r.success > 0) {
                    this.toastrService.success(r.success + " image(s) deleted!");
                    
                    if (this.isFirstPage) {
                        this.redirectNotFound();
                    }
                    else {
                        this.location.back();
                    }
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
