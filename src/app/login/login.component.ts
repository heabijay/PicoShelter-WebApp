import { Component, ViewChild } from "@angular/core";
import { from, Observable } from "rxjs";
import { UserLoginByEmailDto } from "../models/userLoginByEmailDto";
import { UserLoginData } from "../models/userLoginData";
import { UserLoginDto } from "../models/userLoginDto";
import { IdentityHttpService } from "../services/identityHttp.service";
import { SuccessResponseDto } from "../models/successResponseDto"
import { HttpErrorResponse } from "@angular/common/http";
import { TokenService } from "../services/token.service";
import { Router } from "@angular/router";
import { CurrentUserService } from "../services/currentUser.service";
import { ToastrService } from "ngx-toastr";
import { emailRegex } from "../registration/registration.component"
import { NgForm, NgModel } from "@angular/forms";
import { ErrorResponseDto } from "../models/errorResponseDto";
import { ErrorType } from "../enum/ErrorType";

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

    @ViewChild("loginForm") loginForm: NgForm;
    @ViewChild("username") usernameField: NgModel;
    @ViewChild("password") passwordField: NgModel;

    isLoginWindow: boolean = true;
    isReseting: boolean = false;
    recoveryEmail: string;

    @ViewChild("resetPasswordFrom") resetPasswordFrom: NgForm;
    @ViewChild("recoveryEmailField") recoveryEmailField: NgModel;

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
        this.loginForm.control.markAllAsTouched();
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
                }
            },
            (e: HttpErrorResponse) => {
                let error = e?.error as ErrorResponseDto;
                switch (ErrorType[error?.error?.type]) {
                    case ErrorType.CREDENTIALS_INCORRECT:
                        this.usernameField.control.setErrors({
                            'incorrectCredentials': true,
                        });
                        this.passwordField.control.setErrors({
                            'incorrectCredentials': true,
                        });
                        return;
                }

                this.toastrService.error("Something went wrong. :(");
            }
        ).add(
            () => this.isLogging = false
        )
    }

    onFieldsChanged() {
        this.usernameField.control.setErrors({
            'incorrectCredentials': null,
        });
        this.usernameField.control.updateValueAndValidity();
        this.passwordField.control.setErrors({
            'incorrectCredentials': null,
        });
        this.passwordField.control.updateValueAndValidity();
    }

    
    startPasswordReset() {
        this.recoveryEmail = this.user.username;
        this.isLoginWindow = false;
    }

    stopPasswordReset() {
        this.isLoginWindow = true;
        this.user.username = this.recoveryEmail;
    }

    resetPassword() {
        this.resetPasswordFrom.control.markAllAsTouched();
        this.isReseting = true;
        this.identityHttpService.resetPassword(this.recoveryEmail).subscribe(
            data => {
                this.toastrService.success("Instruction sent to your email.")

                this.stopPasswordReset();
            },
            (e: HttpErrorResponse) => {
                switch (e.status) {
                    case 404:
                        this.recoveryEmailField.control.setErrors({
                            'notFound': true,
                        });
                        return;
                }

                this.toastrService.error("Something went wrong. :(");
            }
        ).add(
            () => this.isReseting = false
        )
    }
}