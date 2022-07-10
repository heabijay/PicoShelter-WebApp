import { Component, HostListener, Input, ViewChild } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"
import { Subscription } from "rxjs";
import { ImageShortInfoDto } from "src/app/models/imageShortInfoDto";
import { ImageThumbnailViewModel } from "src/app/profiles/models/imageThumbnailViewModel";
import { AlbumsHttpService } from "src/app/services/albumsHttp.service";
import { CurrentUserService } from "src/app/services/currentUser.service";
import { ImageCacheService } from "src/app/services/imageCache.service";
import { ImagesHttpService } from "src/app/services/imagesHttp.service";
import { ProfilesHttpService } from "src/app/services/profilesHttp.service";

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
            if (this.imageThumbnailViewModel.find(t => t.info.imageId == data[i].imageId))
                continue;

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

    confirm() {
        this.isProceeding = true;
        const imageIds = this.imageThumbnailViewModel.filter(t => t.selected == true).map(t => t.info.imageId).reverse();
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