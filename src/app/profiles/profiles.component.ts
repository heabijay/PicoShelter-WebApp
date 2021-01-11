import { Component } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { ProfileInfoDto } from '../models/profileInfoDto';
import { SuccessResponseDto } from '../models/successResponseDto';
import { CurrentUserService } from '../services/currentUserService';
import { ProfilesHttpService } from "../services/profilesHttpService"
import { ImagesHttpService } from "../services/imagesHttpService"
import { ProfilesDataService } from './profiles.data.service';

@Component({
    templateUrl: './profiles.component.html',
    providers: [
        ProfilesHttpService,
        CurrentUserService,
        ImagesHttpService
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
        private dataService: ProfilesDataService
    ) {
        this.paramSubscription = this.activatedRoute.params.subscribe(param => 
        {
            dataService.clearData();

            var id: number = param["id"];
            var username: string = param["username"];

            var requestMethod : Observable<SuccessResponseDto<ProfileInfoDto>>;

            if (id != null) {
                this.avatarUrl = this.profilesService.getAvatarLink(id);

                if (this.currentUserService.currentUser.id == id)
                    this.profile.userinfo = this.currentUserService.currentUser;

                requestMethod = this.profilesService.getProfile(id);
            }
            else {
                this.avatarUrl = this.profilesService.getAvatarLinkByUsername(username);

                if (this.currentUserService.currentUser?.username?.toLowerCase() == username.toLowerCase())
                    this.profile.userinfo = this.currentUserService.currentUser;

                requestMethod = this.profilesService.getProfileByUsername(username);
            }

            let req = requestMethod.subscribe(
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
            ).add(
                () => req.unsubscribe()
            )
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
}
