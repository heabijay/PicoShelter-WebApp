import { Injectable } from "@angular/core";
import { HttpService } from "../abstract/httpService";
import { TokenService } from "./token.service";
import { HttpClient } from "@angular/common/http"
import { ProfileEditDto } from "../models/profileEditDto"


@Injectable()
export class ProfileHttpService extends HttpService {
    protected subPath = "/api/Profile";

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    editProfile(editedInfo: ProfileEditDto) {
        return this.httpClient.put(
            this.serverUrl + this.subPath + "/edit",
            editedInfo,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    editProfileBackgroundCss(backgroundCss: string) {
        return this.httpClient.put(
            this.serverUrl + this.subPath + "/edit/backgroundCss",
            backgroundCss ? ('"' + backgroundCss + '"') : '""',
            {
                headers: this.identityService.getHeaders().set("Content-Type", "application/json")
            }
        )
    }


    uploadAvatar(file: File) {
        let formData = new FormData();
        formData.append('file', file);
    
        return this.httpClient.post(
            this.serverUrl + this.subPath + "/avatar", 
            formData, 
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    deleteAvatar() {
        return this.httpClient.delete(
            this.serverUrl + this.subPath + "/avatar",
            {
                headers: this.identityService.getHeaders()
            }
        )
    }
}