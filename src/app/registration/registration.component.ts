import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CurrentUserService } from "../services/currentUserService";
import { UserRegistrationDto } from "../models/userRegistrationDto"
import { TokenService } from "../services/tokenService";
import { IdentityHttpService } from "../services/identityHttpService";
import { UserLoginData } from "../models/userLoginData";
import { SuccessResponseDto } from "../models/successResponseDto";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorResponseDto } from "../models/errorResponseDto";
import { ErrorType } from "../enum/ErrorType";
import { FormControl, FormGroup, NgForm, NgModel } from "@angular/forms";

export const emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/gm;

@Component({
    templateUrl: "./registration.component.html"
})
export class RegistrationComponent {
    isProceeding: boolean = false;
    user = new UserRegistrationDto();

    @ViewChild("registrationForm") registrationForm: NgForm;
    @ViewChild("username") usernameField: NgModel;
    @ViewChild("email") emailField: NgModel;
    @ViewChild("password") passwordField: NgModel;
    @ViewChild("confirmPassword") confirmPasswordField: NgModel;

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
        this.registrationForm.control.markAllAsTouched();
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

                this.toastrService.error("Something went wrong. :(");
            }
        ).add(
            () => this.isProceeding = false
        )
    }
}