import { Component, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';
import { ProfileInfoDto } from 'src/app/models/profileInfoDto';
import { CurrentUserService } from 'src/app/services/currentUserService';
import { ImageCacheService } from 'src/app/services/imageCacheService';
import { ImagesHttpService } from 'src/app/services/imagesHttpService';
import { ImageThumbnailViewModel } from '../models/imageThumbnailViewModel';
import { ProfilesDataService } from '../profiles.data.service';

@Component({
    templateUrl: './images.component.html'
})
export class ImagesComponent {
    profile: ProfileInfoDto;
    imageThumbnailViewModel = new Array<ImageThumbnailViewModel>();
    subscription: Subscription;

    get isMyAccount() {
        return this.currentUserService.currentUser?.id == this.profile?.userinfo?.id;
    }

    constructor(
        private imagesService: ImagesHttpService,
        private sanitizer: DomSanitizer,
        private dataService: ProfilesDataService,
        private currentUserService: CurrentUserService,
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
        if (this.profile != null)
            this.loadImageThumbnails(data.images.data);
    }

    loadImageThumbnails(data: Array<ImageShortInfoDto>) {
        this.imageThumbnailViewModel.length = data.length;
        for (let i = 0; i < data.length; i++) {
            this.imageThumbnailViewModel[i] = new ImageThumbnailViewModel();
            this.imageThumbnailViewModel[i].info = data[i];
            let sub = this.imageCacheService.requestThumbnailUsingCache(data[i].imageCode, code => this.imagesService.getThumbnailBlob(code))
                .subscribe(
                    link => this.imageThumbnailViewModel[i].resourceUrl = link
                );
        }
    }
}
