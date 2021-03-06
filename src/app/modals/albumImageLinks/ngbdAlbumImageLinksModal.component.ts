import { Component, Input } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"
import { AlbumInfoDto } from "src/app/models/albumInfoDto";
import { ImageInfoDto } from "src/app/models/imageInfoDto";
import { AlbumsHttpService } from "src/app/services/albumsHttpService";

@Component({
    selector: "ngbd-albumimagelinks-modal",
    templateUrl: "./NgbdAlbumImageLinksModal.component.html",
    providers: [
        AlbumsHttpService
    ]
})
export class NgbdAlbumImageLinksModalComponent {
    @Input() albumInfo: AlbumInfoDto;
    @Input() imageInfo: ImageInfoDto;

    get albumImageLink() {
        return window.location.origin + "/a/" + this.albumInfo?.code + "/" + this.imageInfo?.imageCode;
    }

    get albumImageLinkByUsercode() {
        return window.location.origin + "/s/" + this.albumInfo?.usercode + "/" + this.imageInfo?.imageCode;
    }

    get albumImageDirectLink() {
        return this.albumsService.getImageDirectLink(this.albumInfo?.code, this.imageInfo?.imageCode, this.imageInfo?.imageType);
    }

    get albumImageDirectLinkByUsercode() {
        return this.albumsService.getImageDirectLinkByUserCode(this.albumInfo?.usercode, this.imageInfo?.imageCode, this.imageInfo?.imageType);
    }

    constructor(
        public activeModal: NgbActiveModal,
        private albumsService: AlbumsHttpService
    ) {

    }

    ngOnInit(): void {
        
    }

    close() {
        this.activeModal.close();
    }
}