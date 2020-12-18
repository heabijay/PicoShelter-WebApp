import { Inject, Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { HttpService } from "./httpService"

@Injectable()
export class ProfilesHttpService {
    constructor(private httpService: HttpService) {

    }

    getProfileLink(id: number) {
        return this.httpService.serverUrl + "/profiles/" + id;
    }

    getProfileLinkByUsername(username: string) {
        return this.httpService.serverUrl + "/p/" + username
    }


    getAvatarLink(id: number) {
        return this.getProfileLink(id) + "/avatar.jpg";
    }

    getAvatarLinkByUsername(username: string) {
        return this.getProfileLinkByUsername(username) + "/avatar.jpg";
    }


    getAvatarHead(id: number) {
        return this.httpService.httpClient.head(this.getAvatarLink(id), {
            observe: "response"
        });
    }

    getAvatarHeadByUsername(username: string) {
        return this.httpService.httpClient.head(this.getAvatarLinkByUsername(username));
    }


    getAvatar(id: number) : Observable<Blob> {
        return this.httpService.httpClient.get(
            this.getAvatarLink(id), 
            {
                responseType: "blob"
            }
        )
    }

    getAvatarByUsername(username: string) : Observable<Blob> {
        return this.httpService.httpClient.get(
            this.getAvatarLinkByUsername(username), 
            {
                responseType: "blob"
            }
        )
    }
}