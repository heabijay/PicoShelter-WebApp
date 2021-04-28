import { Component, HostListener, Predicate } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { NgbdProfileImageDeletingModalComponent } from 'src/app/modals/profileImageDeleting/ngbdProfileImageDeletingModal.component';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';
import { ProfileInfoDto } from 'src/app/models/profileInfoDto';
import { AlbumHttpService } from 'src/app/services/albumHttp.service';
import { CurrentUserService } from 'src/app/services/currentUser.service';
import { ImageCacheService } from 'src/app/services/imageCache.service';
import { ImagesHttpService } from 'src/app/services/imagesHttp.service';
import { ProfilesHttpService } from 'src/app/services/profilesHttp.service';
import { ImageThumbnailViewModel } from '../models/imageThumbnailViewModel';
import { ProfilesDataService } from '../profiles.data.service';
import { copyToClipboard } from "../../statics/copyToClipboard";
import { TranslateService } from '@ngx-translate/core';

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
        private albumService: AlbumHttpService,
        private translateService: TranslateService
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

    loadNextPage(size: number = 72) {
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

    setSelect(item: ImageThumbnailViewModel, value: boolean) {
        if (item.selected == value)
            return;
        
        item.selected = value;
        if (value) {
            this.selectedCount++;
        }
        else {
            this.selectedCount--;
        }
    }

    toggleSelect(item: ImageThumbnailViewModel) {
        this.setSelect(item, !item.selected);
    }

    lastSelectedItem: ImageThumbnailViewModel;
    performToggleSelect(item: ImageThumbnailViewModel, event) {
        const newValue = !item.selected;

        if (this.lastSelectedItem && event.shiftKey) {
            this.imageThumbnailViewModel.filter(t => t.preselect).forEach(t => t.preselect = false);
            this.actionToSelection(this.lastSelectedItem, item, (t: ImageThumbnailViewModel) => this.setSelect(t, newValue));
        }
        else {
            this.toggleSelect(item);
        }

        if (item.selected) this.lastSelectedItem = item;
        else this.lastSelectedItem = null;
    }

    isShiftPressed: boolean;
    @HostListener('document:keydown', ['$event'])
    handleKeyPressEvent(event: KeyboardEvent) { 
        if (event.shiftKey) {
            this.isShiftPressed = true;

            if (this.lastSelectedItem && this.mouseHoverItem) {
                this.actionToSelection(this.lastSelectedItem, this.mouseHoverItem, (t: ImageThumbnailViewModel) => t.preselect = true);
            }
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUpEvent(event: KeyboardEvent) { 
        if (event.key == "Shift")
        {
            this.isShiftPressed = false;
            this.imageThumbnailViewModel.filter(t => t.preselect).forEach(t => t.preselect = false);
        }
    }

    mouseHoverItem: ImageThumbnailViewModel;
    onMouseEnter(item: ImageThumbnailViewModel) {
        this.mouseHoverItem = item;

        if (this.lastSelectedItem && this.isShiftPressed) {
            this.imageThumbnailViewModel.filter(t => t.preselect).forEach(t => t.preselect = false);
            this.actionToSelection(this.lastSelectedItem, item, (t: ImageThumbnailViewModel) => t.preselect = true);
        }
    }
    
    onMouseLeave(item: ImageThumbnailViewModel) {
        this.mouseHoverItem = null;
    }

    actionToSelection(from: ImageThumbnailViewModel, to: ImageThumbnailViewModel, action) {
        const fromIndex = this.imageThumbnailViewModel.findIndex(t => t == from);
        const toIndex = this.imageThumbnailViewModel.findIndex(t => t == to);

        const min = toIndex < fromIndex ? toIndex : fromIndex;
        const max = toIndex > fromIndex ? toIndex : fromIndex;

        for (let i = min; i <= max; i++) {
            const el = this.imageThumbnailViewModel[i];
            action(el);
        }
    }

    deleteSelectedImages() {
        const modalRef = this.modalService.open(NgbdProfileImageDeletingModalComponent, { centered: true });
        modalRef.componentInstance.imageCodes = this.imageThumbnailViewModel.filter(t => t.selected == true).map(t => t.info.imageCode);
        modalRef.result.then(
            result => {
                const r = result as { success: number, failed: number };
                if (r.failed > 0) {
                    this.toastrService.error(this.translateService.instant("profile.images.deletingFailed", { count: r.failed }));
                }
                if (r.success > 0) {
                    this.toastrService.success(this.translateService.instant("profile.images.deletingSuccess", { count:r.success }));
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
            this.toastrService.info(this.translateService.instant("shared.linkCopied"));
            this.isSharing = false;
        }
        else {
            this.imagesService.changePublicState(dto.imageCode, true).subscribe(
                data => {
                    dto.isPublic = true;
                    copyToClipboard(window.location.origin + "/i/" + dto.imageCode);
                    this.toastrService.info(this.translateService.instant("shared.linkCopied"));
                },
                error => {
                    this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
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
                    this.toastrService.info(this.translateService.instant("shared.linkCopied"));
                }
            },
            error => {
                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => this.isSharing = false
        );
    }
}
