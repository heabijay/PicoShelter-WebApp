import { Injectable } from "@angular/core";
import { HttpService } from "../abstract/httpService";
import { TokenService } from "./token.service";
import { HttpClient } from "@angular/common/http"
import { AlbumCreateDto } from "../models/albumCreateDto"
import { AlbumCreateAndShareDto } from "../models/albumCreateAndShareDto"
import { SuccessResponseDto } from "../models/successResponseDto"
import { AlbumInfoDto } from "../models/albumInfoDto"


@Injectable()
export class AlbumHttpService extends HttpService {
    protected subPath = "/api/Album";

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    create(dto: AlbumCreateDto) {
        return this.httpClient.post<SuccessResponseDto<AlbumInfoDto>>(
            this.serverUrl + this.subPath + "/create",
            dto,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    createAndShare(imageCodes: Array<number>) {
        let dto = new AlbumCreateAndShareDto();
        dto.isPublic = true;
        dto.joinedPhotos = imageCodes;

        return this.httpClient.post<SuccessResponseDto<AlbumInfoDto>>(
            this.serverUrl + this.subPath + "/create-and-share",
            dto,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }
}