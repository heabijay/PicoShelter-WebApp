import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { HttpService } from "../abstract/httpService"
import { SuccessResponseDto } from "../models/successResponseDto";
import { TokenService } from "./tokenService";
import { ProfileInfoDto } from "../models/profileInfoDto";
import { PaginationResultDto } from "../models/paginationResultDto";
import { ImageShortInfoDto } from "../models/imageShortInfoDto";
import { AlbumShortInfoDto } from "../models/albumShortInfoDto";

@Injectable()
export class ProfilesHttpService extends HttpService {

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient)
    }

    getProfileLink(id: number) {
        return this.serverUrl + "/profiles/" + id;
    }

    getProfileLinkByUsername(username: string) {
        return this.serverUrl + "/p/" + username
    }


    getAvatarLink(id: number) {
        return this.getProfileLink(id) + "/avatar.jpg";
    }

    getAvatarLinkByUsername(username: string) {
        return this.getProfileLinkByUsername(username) + "/avatar.jpg";
    }


    getAvatarHead(id: number) {
        return this.httpClient.head(this.getAvatarLink(id), {
            observe: "response"
        });
    }

    getAvatarHeadByUsername(username: string) {
        return this.httpClient.head(this.getAvatarLinkByUsername(username), {
            observe: "response"
        });
    }


    getAvatar(id: number) : Observable<Blob> {
        return this.httpClient.get(
            this.getAvatarLink(id), 
            {
                responseType: "blob"
            }
        )
    }

    getAvatarByUsername(username: string) : Observable<Blob> {
        return this.httpClient.get(
            this.getAvatarLinkByUsername(username), 
            {
                responseType: "blob"
            }
        )
    }

    getProfile(id: number) {
        return this.httpClient.get<SuccessResponseDto<ProfileInfoDto>>(
            this.getProfileLink(id), 
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    getProfileByUsername(username: string) {
        return this.httpClient.get<SuccessResponseDto<ProfileInfoDto>>(
            this.getProfileLinkByUsername(username), 
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    getProfileImages(id: number, starts?: number, count?: number) {
        let url = this.getProfileLink(id) + '/images?';
        if (starts != null)
            url += "starts=" + starts + "&";
        if (count != null)
            url += "count=" + count + "&";
        
        return this.httpClient.get<SuccessResponseDto<PaginationResultDto<ImageShortInfoDto>>>(
            url,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    getProfileAlbums(id: number, starts?: number, count?: number) {
        let url = this.getProfileLink(id) + '/albums?';
        if (starts != null)
            url += "starts=" + starts + "&";
        if (count != null)
            url += "count=" + count + "&";
        
        return this.httpClient.get<SuccessResponseDto<PaginationResultDto<AlbumShortInfoDto>>>(
            url,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }
}