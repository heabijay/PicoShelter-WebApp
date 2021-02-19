import { Injectable } from "@angular/core";
import { HttpService } from "../abstract/httpService";
import { TokenService } from "./tokenService";
import { HttpClient } from "@angular/common/http"
import { AlbumCreateDto } from "../models/albumCreateDto"
import { AlbumCreateAndShareDto } from "../models/albumCreateAndShareDto"
import { SuccessResponseDto } from "../models/successResponseDto"
import { AlbumInfoDto } from "../models/albumInfoDto"


@Injectable()
export class AlbumsHttpService extends HttpService {

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    getAlbumLink(code: string) {
        return this.serverUrl + "/a/" + code;
    }

    getAlbumLinkByUsercode(usercode: string) {
        return this.serverUrl + "/s/" + usercode
    }

    
    getThumbnail(albumCode: string, imageCode: string) {
        return this.httpClient.get(
            this.getAlbumLink(albumCode) + "/" + imageCode + "/thumbnail.jpg",
            {
                headers: this.identityService.getHeaders(),
                responseType: "blob"
            }
        )
    }
}