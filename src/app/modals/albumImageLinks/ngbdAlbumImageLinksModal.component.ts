import { Component, Input } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"

@Component({
    selector: "ngbd-albumimagelinks-modal",
    templateUrl: "./NgbdAlbumImageLinksModal.component.html"
})
export class NgbdAlbumImageLinksModalComponent {
    @Input() text: string;

    constructor(
        public activeModal: NgbActiveModal
    ) {

    }

    ngOnInit(): void {
        
    }

    closeTrue() {
        this.activeModal.close(true);
    }

    closeFalse() {
        this.activeModal.close(false);
    }

    close() {
        this.activeModal.close(null);
    }
}