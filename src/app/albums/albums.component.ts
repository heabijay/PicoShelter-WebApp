import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AlbumInfoDto } from '../models/albumInfoDto';
import { ImageShortInfoDto } from '../models/imageShortInfoDto';
import { SuccessResponseDto } from '../models/successResponseDto';
import { ImageThumbnailViewModel } from '../profiles/models/imageThumbnailViewModel';
import { AlbumsHttpService } from '../services/albumsHttpService';
import { ImageCacheService } from '../services/imageCacheService';
import { AlbumUserRole } from "../enum/albumUserRole"
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { NgbdAlbumAddImageModalComponent } from "../modals/albumAddImage/ngbdAlbumAddImageModal.component";
import { ToastrService } from 'ngx-toastr';
import { NgbdConfirmModalComponent } from '../modals/confirm/ngbdConfirmModal.component';
import { NgbdAlbumCreateModalComponent } from '../modals/albumCreate/ngbdAlbumCreateModal.component';
import { AlbumCreateDto } from '../models/albumCreateDto';
import { rejects } from 'assert';

@Component({
    templateUrl: './albums.component.html',
    providers: [
        AlbumsHttpService,
        ImageCacheService
    ]
})
export class AlbumsComponent {
    roleType = AlbumUserRole;

    paramSubscription: Subscription;
    album: AlbumInfoDto;

    isLoading = true;
    imageThumbnailViewModel = new Array<ImageThumbnailViewModel>();
    selectedCount: number = 0;
    isDropping = false;

    get isAllImagesLoaded() {
        return this.imageThumbnailViewModel.length >= this.album?.images?.totalCount;
    }

    constructor(
        private albumsService: AlbumsHttpService,
        private activatedRoute: ActivatedRoute,
        private location: Location,
        private router: Router,
        private imageCacheService: ImageCacheService,
        private modalService: NgbModal,
        private toastrService: ToastrService
    ) {
        this.paramSubscription = this.activatedRoute.params.subscribe(param => 
        {
            const code: string = param["code"];
            const usercode: string = param["usercode"];

            let requestMethod : Observable<SuccessResponseDto<AlbumInfoDto>>;

            if (code != null) {
                requestMethod = this.albumsService.getInfo(code);
            }
            else {
                requestMethod = this.albumsService.getInfoByUsercode(usercode);
            }

            requestMethod.subscribe(
                data => {
                    if (data != null && data.success) {
                        this.album = data.data;
                        this.loadImageThumbnails(this.album?.images?.data);
                        this.loadNextPage();
                    }
                },
                error => {
                    this.router.navigateByUrl("/not-found", {
                        skipLocationChange: true
                    });
                }
            );
        });
    }

    loadImageThumbnails(data: Array<ImageShortInfoDto>) {
        for (let i = 0; i < data.length; i++) {
            const newItem = new ImageThumbnailViewModel();
            newItem.info = data[i];
            const sub = this.imageCacheService.requestThumbnailUsingCache(data[i].imageCode, code => this.albumsService.getThumbnailBlob(this.album.code, code))
                .subscribe(
                    link => newItem.resourceUrl = link
                );
            this.imageThumbnailViewModel.push(newItem);
        }
    }

    loadNextPage(size: number = 36) {
        if (!this.isAllImagesLoaded) {
            this.isLoading = true;
            const startIndex = this.imageThumbnailViewModel.length;
            const sub = this.albumsService.getImages(this.album.code, startIndex, size).subscribe(
                data => {
                    if (data.success) {
                        this.album.images.totalCount = data.data.totalCount;
                        this.loadImageThumbnails(data.data.data);
                    }
                }
            ).add(
                () => this.isLoading = false
            );
        } else {
            this.isLoading = false;
        }
    }

    toggleSelect(item: ImageThumbnailViewModel) {
        item.selected = !item.selected;
        if (item.selected)
            this.selectedCount++;
        else 
            this.selectedCount--;
    }

    addImage() {
        const modalRef = this.modalService.open(NgbdAlbumAddImageModalComponent, { centered: true, size: "xl" });
        modalRef.componentInstance.targetAlbumCode = this.album.code;
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.toastrService.success("Images successfully added!");
                    this.reload();
                }
                else if (r == false) {
                    this.toastrService.error("Something went wrong while image adding :(");
                    this.reload();
                }
            },
            rejected => {

            }
        )
    }

    reload() {
        const currentUrl = this.router.url;
        this.router.navigateByUrl("/not-found", { skipLocationChange: true }).then(() => {
            this.router.navigateByUrl(currentUrl);
        })
    }

    dropImages() {
        const modalRef = this.modalService.open(NgbdConfirmModalComponent, { centered: true });
        modalRef.componentInstance.text = "Are you sure you want to drop " + this.selectedCount + " images from album?";
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.isDropping = true;
                    this.albumsService.deleteImages(
                        this.album.code,
                        this.imageThumbnailViewModel.filter(t => t.selected == true).map(t => t.info.imageId)
                    ).subscribe(
                        data => {
                            this.toastrService.success("Images successfully dropped!");
                            this.reload();
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

    editAlbum() {
        const modalRef = this.modalService.open(NgbdAlbumCreateModalComponent, { centered: true });
        modalRef.componentInstance.targetCode = this.album.code;

        const dto = new AlbumCreateDto();
        dto.isPublic = this.album.isPublic;
        dto.title = this.album.title;
        dto.userCode = this.album.usercode;
        modalRef.componentInstance.targetDto = dto;
        modalRef.result.then(
            result => {
                const r = result as boolean;

                if (r == true) {
                    this.reload();
                }
            },
            rejected => {
                
            }
        )
    }
}
