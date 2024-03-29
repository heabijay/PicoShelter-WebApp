import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, timer } from 'rxjs';
import { ImageInfoDto } from '../../models/imageInfoDto';
import { ImageCacheService } from '../../services/imageCache.service';
import { copyToClipboard } from "../../statics/copyToClipboard"
import { downloadFileQuery } from "../../statics/downloadFileQuery"
import { dateFromUTC } from "../../statics/dateFromUTC"
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../services/currentUser.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdProfileImageDeletingModalComponent } from '../../modals/profileImageDeleting/ngbdProfileImageDeletingModal.component';
import { NgbdImageEditModalComponent } from '../../modals/imageEdit/ngbdImageEditModal.component';
import { NgbdImageReportModalComponent } from '../../modals/imageReport/ngbdImageReportModal.component';
import { AlbumsHttpService } from 'src/app/services/albumsHttp.service';
import { ImagesHttpService } from 'src/app/services/imagesHttp.service';
import { AlbumInfoDto } from 'src/app/models/albumInfoDto';
import { SuccessResponseDto } from 'src/app/models/successResponseDto';
import { AlbumUserRole } from 'src/app/enum/albumUserRole';
import { NgbdConfirmModalComponent } from 'src/app/modals/confirm/ngbdConfirmModal.component';
import { NgbdAlbumImageLinksModalComponent } from 'src/app/modals/albumImageLinks/ngbdAlbumImageLinksModal.component';
import { TranslateService } from '@ngx-translate/core';
import { customReuseStrategyClear } from 'src/app/custom-reuse.strategy';
import { NgbdImageCommentsModalComponent } from 'src/app/modals/imageComments/ngbdImageCommentsModal.component';

@Component({
    templateUrl: './images.component.html',
    providers: [
        AlbumsHttpService,
        ImagesHttpService
    ]
})
export class ImagesComponent {
    roleType = AlbumUserRole;

    imageCode: string;
    info: ImageInfoDto;
    albumInfo: AlbumInfoDto;
    infoUploadedDate: Date;
    imageResourceUrl: string;
    thumbnailResourceUrl: string;

    imageWidth: number;
    imageHeight: number;
    imageSize: number;

    countDownToDeleteSub: Subscription;
    countToDelete: number;

    isFirstPage: boolean = true;
    isLikeProcessing: boolean = false;
    isPublicStateChanging: boolean;
    isPublicStateViewModel: boolean;
    isRequestedDownload: boolean;
    isRequestedOpen: boolean;
    isDropping: boolean;

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
        private albumsService: AlbumsHttpService,
        private currentUserService: CurrentUserService,
        public location: Location,
        private modalService: NgbModal,
        private toastrService: ToastrService,
        private translateService: TranslateService
    ) { 
        this.paramSubscription = this.activatedRoute.params.subscribe(param => 
        {
            const albumCode = param["code"];
            const albumUserCode = param["usercode"];
            this.imageCode = param["imgCode"];

            this.isFirstPage = (this.location.getState() as any).navigationId == 1;
            this.imageResourceUrl = null;
            this.info = null;
            this.thumbnailResourceUrl = null;
            this.imageHeight = null;
            this.imageWidth = null;
            this.isRequestedDownload = false;

            let req: Observable<SuccessResponseDto<AlbumInfoDto>>;
            if (albumCode != null)
                req = this.albumsService.getInfo(albumCode);
            else
                req = this.albumsService.getInfoByUsercode(albumUserCode);

            req.subscribe(
                data => {
                    if (data.success) {
                        this.albumInfo = data.data;
                        this.albumsService.getImageInfo(this.albumInfo.code, this.imageCode).subscribe(
                            data => {
                                if (data.success) {
                                    this.info = data.data;
                                    this.onDataLoaded();
                                }
                            },
                            error => {
                                this.redirectNotFound();
                            }
                        );
                    }
                },
                error => {
                    this.redirectNotFound();
                }
            );
        });
    }

    onDataLoaded() {
        this.infoUploadedDate = dateFromUTC(this.info.uploadedTime);
        this.isPublicStateViewModel = this.info.isPublic;
        if (this.info.autoDeleteIn) {
            this.countToDelete = dateFromUTC(this.info.autoDeleteIn).getTime() - new Date().getTime();
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

        this.loadThumbnail(this.info.imageCode);
        this.loadImage(this.info.imageCode, this.info.imageType);
    }

    redirectNotFound() {
        this.router.navigateByUrl("/not-found", {
            skipLocationChange: true
        });
    }

    loadImage(code: string, ext: string) {
        this.imageCache.requestImageUsingCache(
            code, 
            code => this.albumsService.getImageBlob(this.albumInfo.code, code, ext)
        ).subscribe(
            url => {
                this.imageResourceUrl = url;
                this.get_filesize(url, size => {
                    this.imageSize = size
                });
                this.receiveImageData(url);

                if (this.isRequestedDownload)
                {
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
            code => this.albumsService.getThumbnailBlob(this.albumInfo.code, code)
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
        else if (this.albumInfo?.isPublic) {
            window.open(this.albumsService.getImageDirectLink(this.albumInfo.code, this.info.imageCode, this.info.imageType), "_blank");
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
        modalRef.componentInstance.imageCodes = [this.imageCode];
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
                    this.toastrService.success(this.translateService.instant("images.toastr.reportSubmitted"));
                }
                else if (r == false) {
                    this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                }
            }
        )
    }

    dropFromAlbum() {
        if (!this.isDropping) {
            const modalRef = this.modalService.open(NgbdConfirmModalComponent, { centered: true });
            modalRef.componentInstance.text = this.translateService.instant("images.areYouSureToDropFromAlbum");
            modalRef.result.then(
                result => {
                    const r = result as boolean;

                    if (r == true) {
                        this.isDropping = true;
                        this.albumsService.deleteImages(
                            this.albumInfo.code,
                            [this.info.imageId]
                        ).subscribe(
                            data => {
                                this.toastrService.success(this.translateService.instant("images.toastr.dropped"));

                                if (this.isFirstPage) {
                                    this.redirectNotFound();
                                }
                                else {
                                    customReuseStrategyClear();
                                    this.location.back();
                                }
                            },
                            error => {
                                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
                            }
                        ).add(
                            () => this.isDropping = false
                        );
                    }
                },
                rejected => {

                }
            )
        }
    }

    showLinks() {
        const modalRef = this.modalService.open(NgbdAlbumImageLinksModalComponent, { centered: true });
        modalRef.componentInstance.albumInfo = this.albumInfo;
        modalRef.componentInstance.imageInfo = this.info;
    }

    reload() {
        const currentUrl = this.router.url;
        this.router.navigateByUrl("/not-found", { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(currentUrl);
        })
    }

    
    async toggleLikeAsync() {
        if (this.isLikeProcessing)
            return;

        this.isLikeProcessing = true;

        if (this.info.youLikeIt) {
            this.imagesService.undoLikeImage(this.info.imageCode)
                .subscribe(
                    data => {
                        if (this.info.youLikeIt)
                            this.info.likes -= 1;

                        this.info.youLikeIt = false;
                    }
                )
                .add(() => this.isLikeProcessing = false);
        } else {
            this.imagesService.setLikeImage(this.info.imageCode)
                .subscribe(
                    data => {
                        if (!this.info.youLikeIt)
                            this.info.likes += 1;

                        this.info.youLikeIt = true;
                    }
                )
                .add(() => this.isLikeProcessing = false);
        }
    }


    async discussImageAsync() {
        const modalRef = this.modalService.open(NgbdImageCommentsModalComponent, { centered: true, backdrop: false, windowClass: "image-comments-modal" });
        modalRef.componentInstance.imageCode = this.imageCode;
        await modalRef.result;
    }
}
