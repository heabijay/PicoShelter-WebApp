import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CurrentUserService } from "../services/currentUser.service";
import { UserRegistrationDto } from "../models/userRegistrationDto"
import { IdentityHttpService } from "../services/identityHttp.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorResponseDto } from "../models/errorResponseDto";
import { ErrorType } from "../enum/errorType";
import { NgForm, NgModel } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";

export const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/gm;

@Component({
    templateUrl: "./registration.component.html"
})
export class RegistrationComponent {
    isProceeding: boolean = false;
    isNeedCheckEmail: boolean = false;
    user = new UserRegistrationDto();

    @ViewChild("registrationForm") registrationForm: NgForm;
    @ViewChild("username") usernameField: NgModel;
    @ViewChild("email") emailField: NgModel;
    @ViewChild("password") passwordField: NgModel;
    @ViewChild("confirmPassword") confirmPasswordField: NgModel;

    constructor(
        private identityHttpService: IdentityHttpService,
        private currentUserService: CurrentUserService,
        private toastrService: ToastrService,
        private router: Router,
        private translateService: TranslateService
    ) {
        
    }

    ngOnInit(): void {
        if (this.currentUserService.currentUser != null)
        {
            this.router.navigateByUrl("/");
            this.toastrService.info(this.translateService.instant("login.toastr.alreadyLogined"));
        }
    }

    register() {
        this.registrationForm.control.markAllAsTouched();
        this.isProceeding = true;
        let registrationEntity = new UserRegistrationDto();
        registrationEntity.email = this.user.email;
        registrationEntity.username = this.user.username;
        registrationEntity.password = this.user.password;
        this.identityHttpService.register(registrationEntity).subscribe(
            (data) => {
                this.isNeedCheckEmail = true;
            },
            (e: HttpErrorResponse) => {
                let error = e.error as ErrorResponseDto;
                if (error != null) {                    
                    switch (ErrorType[error.error.type]) {
                        case ErrorType.MODEL_NOT_VALID:
                            error.errors.forEach(er => {
                                this.registrationForm.controls[er.param.toLowerCase()].setErrors({
                                    'validationError': true,
                                });
                            });
                            return;
                        case ErrorType.USERNAME_ALREADY_REGISTERED:
                            this.usernameField.control.setErrors({
                                'alreadyRegistered': true,
                            });
                            return;
                        case ErrorType.EMAIL_ALREADY_REGISTERED:
                            this.emailField.control.setErrors({
                                'alreadyRegistered': true,
                            });
                            return;
                    }
                }

                this.toastrService.error(this.translateService.instant("shared.somethingWentWrong"));
            }
        ).add(
            () => this.isProceeding = false
        )
    }
}