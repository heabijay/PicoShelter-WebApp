import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CurrentUserService } from "../services/currentUserService";
import { UserRegistrationDto } from "../models/userRegistrationDto"

@Component({
    templateUrl: "./registration.component.html"
})
export class RegistrationComponent {
    isProceeding: boolean = false;
    user = new UserRegistrationDto();
    
    constructor(
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
}