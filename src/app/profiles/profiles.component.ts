import { Component } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { ProfileInfoDto } from '../models/profileInfoDto';
import { SuccessResponseDto } from '../models/successResponseDto';
import { CurrentUserService } from '../services/currentUser.service';
import { ProfilesHttpService } from "../services/profilesHttp.service"
import { ImagesHttpService } from "../services/imagesHttp.service"
import { ProfilesDataService } from './profiles.data.service';
import { copyToClipboard } from "../statics/copyToClipboard"
import { AlbumHttpService } from '../services/albumHttp.service';
import { AlbumsHttpService } from '../services/albumsHttp.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    templateUrl: './profiles.component.html',
    providers: [
        ProfilesHttpService,
        CurrentUserService,
        ImagesHttpService,
        AlbumHttpService,
        AlbumsHttpService
    ]
})
export class ProfilesComponent {
    profile = new ProfileInfoDto();
    avatarUrl: string;
    paramSubscription: Subscription;
    urlSubscription: Subscription; 

    isOverview: boolean;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private profilesService: ProfilesHttpService,
        private currentUserService: CurrentUserService,
        private toastrService: ToastrService,
        private dataService: ProfilesDataService,
        private albumService: AlbumHttpService,
        private albumsService: AlbumsHttpService,
        private translateService: TranslateService
    ) {
        this.paramSubscription = this.activatedRoute.params.subscribe(param => 
        {
            dataService.clearData();

            const id: number = param["id"];
            const username: string = param["username"];

            let requestMethod : Observable<SuccessResponseDto<ProfileInfoDto>>;

            if (id != null) {
                this.avatarUrl = this.profilesService.getAvatarLink(id);

                if (this.currentUserService.currentUser?.id == id)
                    this.profile.userinfo = this.currentUserService.currentUser;

                requestMethod = this.profilesService.getInfo(id);
            }
            else {
                this.avatarUrl = this.profilesService.getAvatarLinkByUsername(username);

                if (this.currentUserService.currentUser?.username?.toLowerCase() == username.toLowerCase())
                    this.profile.userinfo = this.currentUserService.currentUser;

                requestMethod = this.profilesService.getInfoByUsername(username);
            }

            requestMethod.subscribe(
                data => {
                    if (data != null && data.success) {
                        this.profile = data.data;
                        
                        this.dataService.sendData(this.profile);
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

    ngOnInit(): void {
        this.urlSubscription = this.router.events.subscribe(
            event => {
                if (event instanceof NavigationStart) {
                    this.isOverview = (event.url.match(/\//g) || []).length <= 2;
                }
            }
        );
        this.isOverview = (this.router.url.match(/\//g) || []).length <= 2;
    }

    ngOnDestroy(): void {
        this.urlSubscription.unsubscribe();
    }

    copyBeautifulLink() {
        copyToClipboard(window.location.origin + "/p/" + this.profile.userinfo.username);
        this.toastrService.info(this.translateService.instant("shared.linkCopied"));
    }

    onActivate(event) {
        window?.scrollTo(0, 0);
    }
}
