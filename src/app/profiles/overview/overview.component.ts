import { Component, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesHttpService } from '../../services/imagesHttp.service';
import { ProfilesDataService } from '../profiles.data.service';
import { Subscription } from 'rxjs';
import { ProfileInfoDto } from '../../models/profileInfoDto';
import { ImageShortInfoDto } from 'src/app/models/imageShortInfoDto';
import { ImageCacheService } from '../../services/imageCache.service';
import { ImageThumbnailViewModel } from '../models/imageThumbnailViewModel';
import { AlbumViewModel } from '../models/albumViewModel';
import { AlbumShortInfoDto } from 'src/app/models/albumShortInfoDto';
import { AlbumsHttpService } from 'src/app/services/albumsHttp.service';
import { CurrentUserService } from 'src/app/services/currentUser.service';

@Component({
    templateUrl: './overview.component.html'
})
export class OverviewComponent {
    profile: ProfileInfoDto;
    imageThumbnailViewModels = new Array<ImageThumbnailViewModel>();
    albumViewModels = new Array<AlbumViewModel>();
    subscription: Subscription;

    get isMyAccount() {
        return this.currentUserService.currentUser?.id == this.profile?.userinfo?.id;
    }

    constructor(
        private imagesService: ImagesHttpService,
        private dataService: ProfilesDataService,
        private imageCacheService: ImageCacheService,
        private currentUserService: CurrentUserService,
        private albumsService: AlbumsHttpService
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
        {
            this.loadImageThumbnails(data?.images?.data?.slice(0, 12));
            this.loadAlbums(data?.albums?.data?.slice(0, 3));
        }
    }

    loadImageThumbnails(data: Array<ImageShortInfoDto>) {
        this.imageThumbnailViewModels.length = data.length;
        for (let i = 0; i < data.length; i++) {
            const el = new ImageThumbnailViewModel();
            el.info = data[i];
            let sub = this.imageCacheService.requestThumbnailUsingCache(el.info.imageCode, code => this.imagesService.getThumbnailBlob(code))
                .subscribe(
                    link => el.resourceUrl = link
                );
            
            this.imageThumbnailViewModels[i] = el;
        }
    }

    loadAlbums(dtos: Array<AlbumShortInfoDto>) {
        for (let i = 0; i < dtos?.length; i++) {
            const el = new AlbumViewModel();
            el.dto = dtos[i];
            
            if (el.dto?.previewImage != null) {
                const sub = this.imageCacheService.requestThumbnailUsingCache(el.dto.previewImage.imageCode, code => this.albumsService.getThumbnailBlob(el.dto.code, el.dto.previewImage.imageCode))
                    .subscribe(
                        link => el.thumbnailResourceUrl = link
                    );
            }

            this.albumViewModels.push(el);
        }
    }
}
