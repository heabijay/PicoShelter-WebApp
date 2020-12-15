import { Location } from "@angular/common";
import { Component } from "@angular/core";

const delay = ms => new Promise(res => setTimeout(res, ms));

@Component({
    templateUrl: "./not-found.component.html"
})
export class NotFoundComponent {
    seconds: number = 5;

    constructor(private location: Location) {
        
    }

    ngOnInit(): void {
        this.waitSeconds();
    }

    async waitSeconds() {
        while (--this.seconds > 0) {
            await delay(1000);
        }
        this.returnBack();
    }

    returnBack() {
        this.location.back();
    }
}