import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CurrentUserService } from "../services/currentUserService";
import { UserRegistrationDto } from "../models/userRegistrationDto"
import { TokenService } from "../services/tokenService";
import { IdentityHttpService } from "../services/identityHttpService";
import { UserLoginData } from "../models/userLoginData";
import { SuccessResponseDto } from "../models/successResponseDto";
import { HttpErrorResponse } from "@angular/common/http";

export const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/gm;

@Component({
    templateUrl: "./registration.component.html"
})
export class RegistrationComponent {
    isProceeding: boolean = false;
    user = new UserRegistrationDto();
    
    constructor(
        private identityHttpService: IdentityHttpService, 
        private tokenService: TokenService,
        private currentUserService: CurrentUserService,
        private toastrService: ToastrService,
        private router: Router,
    ) {
        
    }

    ngOnInit(): void {
        if (this.currentUserService.currentUser != null)
        {
            this.router.navigateByUrl("/");
            this.toastrService.info("You're already logined!");
        }
    }

    register() {
        this.isProceeding = true;
        let registrationEntity = new UserRegistrationDto();
        registrationEntity.email = this.user.email;
        registrationEntity.username = this.user.username;
        registrationEntity.password = this.user.password;
        this.identityHttpService.register(registrationEntity).subscribe(
            (data: SuccessResponseDto<UserLoginData>) => {
                if (data.success) {
                    this.tokenService.setTokenWithProfile(data.data);
                    this.router.navigateByUrl("/profiles/" + data.data.user.id);
                    this.toastrService.success("Registration successful!");
                }
            },
            (e: HttpErrorResponse) => {
                this.toastrService.error(e.error.error.message);
            }
        ).add(
            () => this.isProceeding = false
        )
    }
}