import { Component, Input } from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { AlbumInfoDto } from "src/app/models/albumInfoDto";
import { ImageInfoDto } from "src/app/models/imageInfoDto";
import { AlbumsHttpService } from "src/app/services/albumsHttp.service";
import { CurrentUserService } from "src/app/services/currentUser.service";
import { ImagesHttpService } from "src/app/services/imagesHttp.service";
import { BooleanLiteral } from "typescript";
import { copyToClipboard } from "../../static/copyToClipboard"

@Component({
    selector: "ngbd-albumimagelinks-modal",
    templateUrl: "./NgbdAlbumImageLinksModal.component.html",
    providers: [
        AlbumsHttpService,
        ImagesHttpService
    ]
})
export class NgbdAlbumImageLinksModalComponent {
    @Input() albumInfo: AlbumInfoDto;
    @Input() imageInfo: ImageInfoDto;

    get imageLink() {
        return window.location.origin + "/i/" + this.imageInfo?.imageCode;
    }


    get imageDirectLink() {
        return this.imagesService.getImageDirectLink(this.imageInfo?.imageCode, this.imageInfo?.imageType);
    }

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
        private albumsService: AlbumsHttpService,
        private imagesService: ImagesHttpService,
        private toastrService: ToastrService,
        private currentUser: CurrentUserService,
        private translateService: TranslateService
    ) {

    }

    copyLink(url: string) {
        copyToClipboard(url);
        this.toastrService.info(this.translateService.instant("shared.linkCopied"));
    }

    close() {
        this.activeModal.close();
    }
}