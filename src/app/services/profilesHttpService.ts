import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { HttpService } from "../abstract/httpService"
import { SuccessResponseDto } from "../models/successResponseDto";
import { TokenService } from "./tokenService";
import { ProfileInfoDto } from "../models/profileInfoDto";

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
            this.getProfileByUsername(username), 
            {
                headers: this.identityService.getHeaders()
            }
        );
    }
}