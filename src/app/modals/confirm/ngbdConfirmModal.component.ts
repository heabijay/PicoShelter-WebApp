import { Component, Input } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"

@Component({
    selector: "ngbd-confirm-modal",
    templateUrl: "./ngbdConfirmModal.component.html"
})
export class NgbdConfirmModalComponent {
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