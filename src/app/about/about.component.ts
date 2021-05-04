import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
    templateUrl: "./about.component.html"
})
export class AboutComponent {
    paramSubscription : Subscription;
    isAll: boolean;

    constructor(
        private activatedRoute: ActivatedRoute
    ) {
        this.paramSubscription = this.activatedRoute.queryParams.subscribe(param => 
        {
            this.isAll = param["all"] != null;
        });
    }
}