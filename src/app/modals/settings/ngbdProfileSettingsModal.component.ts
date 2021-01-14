import { Component } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"

@Component({
    selector: "ngbd-profilesettings-modal",
    templateUrl: "./ngbdProfileSettingsModal.component.html"
})
export class NgbdProfileSettingsModalComponent {
    constructor(
        public activeModal: NgbActiveModal
    ) {
        
    }

    close() {
        this.activeModal.close();
    }
}