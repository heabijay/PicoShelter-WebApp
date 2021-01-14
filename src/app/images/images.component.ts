import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './images.component.html'
})
export class ImagesComponent {
    paramSubscription: Subscription;
    urlSubscription: Subscription; 

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { 
        this.paramSubscription = this.activatedRoute.params.subscribe(param => 
            {    
                var code: number = param["code"];
    
                // var requestMethod : Observable<SuccessResponseDto<ProfileInfoDto>>;
    
                // if (id != null) {
                //     this.avatarUrl = this.profilesService.getAvatarLink(id);
    
                //     if (this.currentUserService.currentUser.id == id)
                //         this.profile.userinfo = this.currentUserService.currentUser;
    
                //     requestMethod = this.profilesService.getProfile(id);
                // }
                // else {
                //     this.avatarUrl = this.profilesService.getAvatarLinkByUsername(username);
    
                //     if (this.currentUserService.currentUser?.username?.toLowerCase() == username.toLowerCase())
                //         this.profile.userinfo = this.currentUserService.currentUser;
    
                //     requestMethod = this.profilesService.getProfileByUsername(username);
                // }
    
                // requestMethod.subscribe(
                //     data => {
                //         if (data != null && data.success) {
                //             this.profile = data.data;
                            
                //             this.dataService.sendData(this.profile);
                //         }
                //     },
                //     error => {
                //         this.router.navigateByUrl("/not-found", {
                //             skipLocationChange: true
                //         });
                //     }
                // );
            });
    }
}
