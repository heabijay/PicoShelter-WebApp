import { Component } from "@angular/core";
import { from, Observable } from "rxjs";
import { UserLoginByEmailDto } from "../models/userLoginByEmailDto";
import { UserLoginData } from "../models/userLoginData";
import { UserLoginDto } from "../models/userLoginDto";
import { IdentityHttpService } from "../services/identityHttpService";
import { SuccessResponseDto } from "../models/successResponseDto"
import { HttpErrorResponse } from "@angular/common/http";
import { TokenService } from "../services/tokenService";
import { Router } from "@angular/router";
import { CurrentUserService } from "../services/currentUserService";
import { ToastrService } from "ngx-toastr";
import { emailRegex } from "../registration/registration.component"

@Component({
    templateUrl: "./login.component.html",
    providers: [
        IdentityHttpService
    ]
})
export class LoginComponent {
    isAlreadyLoggined: boolean = false;
    isLogging: boolean = false;
    user = new UserLoginDto();

    constructor(
        private identityHttpService: IdentityHttpService, 
        private tokenService: TokenService, 
        private currentUserService: CurrentUserService,
        private toastrService: ToastrService,
        private router: Router
    ) {
        
    }

    ngOnInit(): void {
        if (this.currentUserService.currentUser != null)
        {
            this.router.navigateByUrl("/");
            this.toastrService.info("You're already logined!");
        }
    }

    login() {
        this.isLogging = true;
        let loginQuery: Observable<Object>;
        if (emailRegex.test(this.user.username)) {
            let LoginEntity = new UserLoginByEmailDto();
            LoginEntity.email = this.user.username;
            LoginEntity.password = this.user.password;
            loginQuery = this.identityHttpService.loginByEmail(LoginEntity);
        }
        else {
            loginQuery = this.identityHttpService.login(this.user);
        }
        loginQuery.subscribe(
            (data: SuccessResponseDto<UserLoginData>) => {
                if (data.success) {
                    this.tokenService.setTokenWithProfile(data.data);
                    this.router.navigateByUrl("/profiles/" + data.data.user.id);
                    this.toastrService.success("Login successful!");
                }
            },
            (e: HttpErrorResponse) => {
                this.toastrService.error(e.error.error.message);
            }
        ).add(
            () => this.isLogging = false
        )
    }
}