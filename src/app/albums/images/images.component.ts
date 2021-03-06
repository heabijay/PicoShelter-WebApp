import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, timer } from 'rxjs';
import { ImageInfoDto } from '../../models/imageInfoDto';
import { ImageCacheService } from '../../services/imageCacheService';
import { copyToClipboard } from "../../static/copyToClipboard"
import { downloadFileQuery } from "../../static/downloadFileQuery"
import { dateFromUTС } from "../../static/dateFromUTC"
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../../services/currentUserService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdProfileImageDeletingModalComponent } from '../../modals/profileImageDeleting/ngbdProfileImageDeletingModal.component';
import { ImageEditDto } from '../../models/imageEditDto';
import { NgbdImageEditModalComponent } from '../../modals/imageEdit/ngbdImageEditModal.component';
import { AlbumsHttpService } from 'src/app/services/albumsHttpService';
import { ImagesHttpService } from 'src/app/services/imagesHttpService';
import { AlbumInfoDto } from 'src/app/models/albumInfoDto';
import { SuccessResponseDto } from 'src/app/models/successResponseDto';
import { AlbumUserRole } from 'src/app/enum/albumUserRole';
import { NgbdConfirmModalComponent } from 'src/app/modals/confirm/ngbdConfirmModal.component';
import { NgbdAlbumImageLinksModalComponent } from 'src/app/modals/albumImageLinks/ngbdAlbumImageLinksModal.component';

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

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private imageCache: ImageCacheService,
        private imagesService: ImagesHttpService,
        private albumsService: AlbumsHttpService,
        private currentUserService: CurrentUserService,
        public location: Location,
        private modalService: NgbModal,
        private sanitizer: DomSanitizer,
        private toastrService: ToastrService
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
        this.infoUploadedDate = dateFromUTС(this.info.uploadedTime);
        this.isPublicStateViewModel = this.info.isPublic;
        if (this.info.autoDeleteIn) {
            this.countToDelete = dateFromUTС(this.info.autoDeleteIn).getTime() - new Date().getTime();
            this.countDownToDeleteSub = timer(0, 1000).subscribe(
                () => this.countToDelete -= 1000
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
        modalRef.componentInstance.imageCodes = [this.imageCode];
        modalRef.result.then(
            result => {
                const r = result as { success: number, failed: number };
                if (r.failed > 0) {
                    this.toastrService.error(r.failed + " image(s) wasn't deleted due to error.");
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
            },
            rejected => {
                
            }
        )
    }

    dropFromAlbum() {
        if (!this.isDropping) {
            const modalRef = this.modalService.open(NgbdConfirmModalComponent, { centered: true });
            modalRef.componentInstance.text = "Are you sure you want to drop this image from album?";
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
                                this.toastrService.success("Images successfully dropped!");

                                if (this.isFirstPage) {
                                    this.redirectNotFound();
                                }
                                else {
                                    this.location.back();
                                }
                            },
                            error => {
                                this.toastrService.error("Something went wrong while image dropping :(");
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
        modalRef.componentInstance.text = "Are you sure you want to drop this image from album?";
    }

    reload() {
        const currentUrl = this.router.url;
        this.router.navigateByUrl("/not-found", { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(currentUrl);
        })
    }
}
