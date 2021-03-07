import { Location } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    templateUrl: "./not-found.component.html"
})
export class NotFoundComponent {

    constructor(public location: Location, public router: Router) {
        
    }

    gotoBack() {
        const isFirstPage = (this.location.getState() as any).navigationId == 1;
        if (isFirstPage) {
            this.router.navigateByUrl("/");
        }
        else {
            this.location.back();
        }
    }
}