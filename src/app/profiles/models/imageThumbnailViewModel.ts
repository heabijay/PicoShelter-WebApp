import { ImageShortInfoDto } from "../../models/imageShortInfoDto";

export class ImageThumbnailViewModel {
    info: ImageShortInfoDto;
    resourceUrl: string;
    selected: boolean;
    preselect: boolean;
}