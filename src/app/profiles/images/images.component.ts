import { Component, HostListener, SecurityContext } from '@angular/core';
import { Subscription } from 'rxjs';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';
import { ProfileInfoDto } from 'src/app/models/profileInfoDto';
import { CurrentUserService } from 'src/app/services/currentUserService';
import { ImageCacheService } from 'src/app/services/imageCacheService';
import { ImagesHttpService } from 'src/app/services/imagesHttpService';
import { ProfilesHttpService } from 'src/app/services/profilesHttpService';
import { ImageThumbnailViewModel } from '../models/imageThumbnailViewModel';
import { ProfilesDataService } from '../profiles.data.service';

@Component({
    templateUrl: './images.component.html'
})
export class ImagesComponent {
    profile: ProfileInfoDto;
    imageThumbnailViewModel = new Array<ImageThumbnailViewModel>();
    subscription: Subscription;

    isLoading: boolean = true;

    get isMyAccount() {
        return this.currentUserService.currentUser?.id == this.profile?.userinfo?.id;
    }

    get isAllImagesLoaded() {
        return this.imageThumbnailViewModel.length == this.profile?.images?.totalCount;
    }

    constructor(
        private imagesService: ImagesHttpService,
        private dataService: ProfilesDataService,
        private currentUserService: CurrentUserService,
        private profilesService: ProfilesHttpService,
        private imageCacheService: ImageCacheService
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
            const sub = this.profilesService.getProfileImages(this.profile.userinfo.id, startIndex, size).subscribe(
                data => {
                    if (data.success) {
                        this.loadImageThumbnails(data.data.data);
                    }
                }
            ).add(
                () => this.isLoading = false
            );
        }
    }
}
