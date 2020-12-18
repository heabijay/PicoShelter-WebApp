import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { UserLoginByEmailDto } from "../models/userLoginByEmailDto";
import { UserLoginData } from "../models/userLoginData";
import { UserLoginDto } from "../models/userLoginDto";
import { IdentityHttpService } from "../services/identityHttpService";
import { SuccessResponseDto } from "../models/successResponseDto"
import { ErrorResponseDto } from "../models/errorResponseDto"
import { HttpErrorResponse } from "@angular/common/http";
import { IdentityService } from "../services/identityService";
import { Router } from "@angular/router";

const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/gm;

@Component({
    templateUrl: "./login.component.html",
    providers: [
        IdentityHttpService
    ]
})
export class LoginComponent {
    error: string;
    isLogging: boolean = false;
    user = new UserLoginDto();

    constructor(
        private identityHttpService: IdentityHttpService, 
        private identityService: IdentityService, 
        private router: Router
    ) {
        
    }

    login() {
        this.isLogging = true;
        this.error = null;
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
                    this.identityService.setIdentity(data.data);
                    this.router.navigateByUrl("/profiles/" + data.data.user.id);
                }
            },
            (e: HttpErrorResponse) => {
                this.error = e.error.error.message;
            }
        ).add(
            () => this.isLogging = false
        )
    }
}