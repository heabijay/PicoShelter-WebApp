import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, ViewChild } from "@angular/core"
import { NgModel } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { ErrorType } from "src/app/enum/ErrorType";
import { AlbumInfoDto } from "src/app/models/albumInfoDto";
import { ErrorResponseDto } from "src/app/models/errorResponseDto";
import { ImageShortInfoDto } from "src/app/models/imageShortInfoDto";
import { ImageThumbnailViewModel } from "src/app/profiles/models/imageThumbnailViewModel";
import { AlbumsHttpService } from "src/app/services/albumsHttpService";
import { CurrentUserService } from "src/app/services/currentUserService";
import { ImageCacheService } from "src/app/services/imageCacheService";
import { ImagesHttpService } from "src/app/services/imagesHttpService";
import { ProfilesHttpService } from "src/app/services/profilesHttpService";
import { AlbumCreateDto } from "../../models/albumCreateDto";
import { AlbumHttpService } from "../../services/albumHttpService";

@Component({
    selector: "ngbd-albumaddimage-modal",
    templateUrl: "./ngbdAlbumAddImageModal.component.html",
    providers: [
        ProfilesHttpService,
        ImagesHttpService,
        AlbumsHttpService
    ]
})
export class NgbdAlbumAddImageModalComponent {
    @Input()targetAlbumCode?: string;

    imageThumbnailViewModel = new Array<ImageThumbnailViewModel>();
    subscription: Subscription;

    isMyAccount = true;
    isLoading: boolean = true;
    selectedCount: number = 0;
    totalCount: number;
    isProceeding: boolean;

    result: boolean;

    get isAllImagesLoaded() {
        return this.imageThumbnailViewModel.length >= this.totalCount;
    }

    constructor(
        public activeModal: NgbActiveModal,
        private imageCacheService: ImageCacheService,
        private profilesService: ProfilesHttpService,
        private currentUserService: CurrentUserService,
        private imagesService: ImagesHttpService,
        private albumsService: AlbumsHttpService
    ) {

    }

    ngOnInit(): void {
        this.loadNextPage();
    }

    loadImageThumbnails(data: Array<ImageShortInfoDto>) {
        for (let i = 0; i < data.length; i++) {
            const newItem = new ImageThumbnailViewModel();
            newItem.info = data[i];
            const sub = this.imageCacheService.requestThumbnailUsingCache(data[i].imageCode, code => this.imagesService.getThumbnailBlob(code))
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
            const sub = this.profilesService.getImages(this.currentUserService.currentUser.id, startIndex, size).subscribe(
                data => {
                    if (data.success) {
                        this.totalCount = data.data.totalCount;
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

    close() {
        this.activeModal.close(this.result);
    }

    toggleSelect(item: ImageThumbnailViewModel) {
        item.selected = !item.selected;
        if (item.selected)
            this.selectedCount++;
        else 
            this.selectedCount--;
    }

    confirm() {
        this.isProceeding = true;
        const imageIds = this.imageThumbnailViewModel.filter(t => t.selected == true).map(t => t.info.imageId);
        this.albumsService.addImages(this.targetAlbumCode, imageIds).subscribe(
            data => {
                this.result = true;
            },
            error => {
                this.result = false;
            }
        ).add(
            () => {
                this.isProceeding = false;
                this.close();
            }
        )
    }
}