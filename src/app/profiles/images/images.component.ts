import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { NgbdProfileImageDeletingModalComponent } from 'src/app/modals/profileImageDeleting/ngbdProfileImageDeletingModal.component';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';
import { ProfileInfoDto } from 'src/app/models/profileInfoDto';
import { AlbumHttpService } from 'src/app/services/albumHttpService';
import { CurrentUserService } from 'src/app/services/currentUserService';
import { ImageCacheService } from 'src/app/services/imageCacheService';
import { ImagesHttpService } from 'src/app/services/imagesHttpService';
import { ProfilesHttpService } from 'src/app/services/profilesHttpService';
import { ImageThumbnailViewModel } from '../models/imageThumbnailViewModel';
import { ProfilesDataService } from '../profiles.data.service';
import { copyToClipboard } from "../../static/copyToClipboard";

@Component({
    templateUrl: './images.component.html',
    providers: [
        NgbActiveModal
    ]
})
export class ImagesComponent {
    profile: ProfileInfoDto;
    imageThumbnailViewModel = new Array<ImageThumbnailViewModel>();
    subscription: Subscription;

    isLoading: boolean = true;
    selectedCount: number = 0;

    isSharing: boolean = false;

    get isMyAccount() {
        return this.currentUserService.currentUser?.id == this.profile?.userinfo?.id;
    }

    get isAllImagesLoaded() {
        return this.imageThumbnailViewModel.length >= this.profile?.images?.totalCount;
    }

    constructor(
        private router: Router,
        private imagesService: ImagesHttpService,
        private dataService: ProfilesDataService,
        private currentUserService: CurrentUserService,
        private profilesService: ProfilesHttpService,
        private imageCacheService: ImageCacheService,
        private modalService: NgbModal,
        private toastrService: ToastrService,
        private albumService: AlbumHttpService
    ) {
        
    }

    ngOnInit(): void {
        this.subscription = this.dataService.getData().subscribe(
            data => {
                this.onProfileDataRefresh(data);
            }
        )
        this.onProfileDataRefresh(this.dataService.getLastReceivedData());
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onProfileDataRefresh(data: ProfileInfoDto) {
        this.profile = data;
        if (this.profile != null) {
            this.loadImageThumbnails(data.images.data);
            this.loadNextPage();
        }
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
            const sub = this.profilesService.getImages(this.profile.userinfo.id, startIndex, size).subscribe(
                data => {
                    if (data.success) {
                        this.profile.images.totalCount = data.data.totalCount;
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

    deleteSelectedImages() {
        const modalRef = this.modalService.open(NgbdProfileImageDeletingModalComponent, { centered: true });
        modalRef.componentInstance.imageCodes = this.imageThumbnailViewModel.filter(t => t.selected == true).map(t => t.info.imageCode);
        modalRef.result.then(
            result => {
                const r = result as { success: number, failed: number };
                if (r.failed > 0) {
                    this.toastrService.error(r.failed + " image(s) wasn't deleted due to error.");
                }
                if (r.success > 0) {
                    this.toastrService.success(r.success + " image(s) deleted!");
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

    
    shareImage() {
        this.isSharing = true;
        const selectedItems = this.imageThumbnailViewModel.filter(t => t.selected == true);
        const dto = selectedItems[0].info;

        if (dto.isPublic) {
            copyToClipboard(window.location.origin + "/i/" + dto.imageCode);
            this.toastrService.info("Link copied to clipboard!");
            this.isSharing = false;
        }
        else {
            this.imagesService.changePublicState(dto.imageCode, true).subscribe(
                data => {
                    dto.isPublic = true;
                    copyToClipboard(window.location.origin + "/i/" + dto.imageCode);
                    this.toastrService.info("Link copied to clipboard!");
                },
                error => {
                    this.toastrService.error("Something went wrong :(");
                }
            ).add(
                () => this.isSharing = false
            );
        }
    }

    shareAsAlbum() {
        this.isSharing = true;
        const selectedItems = this.imageThumbnailViewModel.filter(t => t.selected == true);
        const ids = selectedItems.map(t => t.info.imageId);
        this.albumService.createAndShare(ids).subscribe(
            data => {
                if (data.success) {
                    copyToClipboard(window.location.origin + "/a/" + data.data.code);
                    this.toastrService.info("Link copied to clipboard!");
                }
            },
            error => {
                this.toastrService.error("Something went wrong :(");
            }
        ).add(
            () => this.isSharing = false
        );
    }
}
