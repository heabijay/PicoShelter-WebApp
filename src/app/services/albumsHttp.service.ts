import { Injectable } from "@angular/core";
import { HttpService } from "../abstract/httpService";
import { TokenService } from "./token.service";
import { HttpClient } from "@angular/common/http"
import { AlbumCreateDto } from "../models/albumCreateDto"
import { AlbumCreateAndShareDto } from "../models/albumCreateAndShareDto"
import { SuccessResponseDto } from "../models/successResponseDto"
import { AlbumInfoDto } from "../models/albumInfoDto"
import { ImageShortInfoDto } from "../models/imageShortInfoDto";
import { PaginationResultDto } from "../models/paginationResultDto";
import { ImageInfoDto } from "../models/imageInfoDto";
import { AlbumProfileInfoDto } from "../models/albumProfileInfoDto";
import { AlbumUserRole } from "../enum/albumUserRole";
import { UserInfo } from "../models/userInfo";


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

    getImageLink(albumCode: string, imageCode: string) {
        return this.getAlbumLink(albumCode) + '/' + imageCode;
    }

    getImageLinkByUsercode(albumUsercode: string, imageCode: string) {
        return this.getAlbumLinkByUsercode(albumUsercode) + '/' + imageCode;
    }

    getImageDirectLink(albumCode: string, imageCode: string, imageExt: string) {
        return this.getImageLink(albumCode, imageCode) + '.' + imageExt.replace("jpeg", "jpg"); 
    }

    getImageDirectLinkByUserCode(albumUsercode: string, imageCode: string, imageExt: string) {
        return this.getImageLinkByUsercode(albumUsercode, imageCode) + '.' + imageExt.replace("jpeg", "jpg"); 
    }
    
    getImageBlob(albumCode: string, imageCode: string, imageExt: string)
    {
        return this.httpClient.get(
            this.getAlbumLink(albumCode) + "/" + imageCode + '.' + imageExt,
            {
                headers: this.identityService.getHeaders(),
                responseType: "blob"
            }
        )
    }

    getThumbnailBlob(albumCode: string, imageCode: string) {
        return this.httpClient.get(
            this.getAlbumLink(albumCode) + "/" + imageCode + "/thumbnail.jpg",
            {
                headers: this.identityService.getHeaders(),
                responseType: "blob"
            }
        )
    }

    getInfo(code: string) {
        return this.httpClient.get<SuccessResponseDto<AlbumInfoDto>>(
            this.getAlbumLink(code),
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    getInfoByUsercode(usercode: string) {
        return this.httpClient.get<SuccessResponseDto<AlbumInfoDto>>(
            this.getAlbumLinkByUsercode(usercode),
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    getImageInfo(albumCode: string, imageCode: string) {
        return this.httpClient.get<SuccessResponseDto<ImageInfoDto>>(
            this.getImageLink(albumCode, imageCode),
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    getImageInfoByUsercode(albumUserCode: string, imageCode: string) {
        return this.httpClient.get<SuccessResponseDto<ImageInfoDto>>(
            this.getImageLink(albumUserCode, imageCode),
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    getImages(code: string, starts?: number, count?: number) {
        let url = this.getAlbumLink(code) + '/images?';
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

    getUsers(code: string, starts?: number, count?: number) {
        let url = this.getAlbumLink(code) + '/users?';
        if (starts != null)
            url += "starts=" + starts + "&";
        if (count != null)
            url += "count=" + count + "&";
        
        return this.httpClient.get<SuccessResponseDto<PaginationResultDto<AlbumProfileInfoDto>>>(
            url,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    addImages(code: string, imageIds: Array<number>) {
        return this.httpClient.post(
            this.getAlbumLink(code) + '/addimages',
            imageIds,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    deleteImages(code: string, imageIds: Array<number>) {
        return this.httpClient.request(
            'DELETE',
            this.getAlbumLink(code) + '/deleteimages',
            {
                headers: this.identityService.getHeaders(),
                body: imageIds
            }
        )
    }

    edit(code: string, dto: AlbumCreateDto) {
        return this.httpClient.put(
            this.getAlbumLink(code),
            dto,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    delete(code: string) {
        return this.httpClient.delete(
            this.getAlbumLink(code),
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    deleteMembers(code: string, userIds: Array<number>) {
        return this.httpClient.request(
            'DELETE',
            this.getAlbumLink(code) + '/deleteMembers',
            {
                headers: this.identityService.getHeaders(),
                body: userIds
            }
        )
    }

    changeRole(code: string, profileId: number, role: AlbumUserRole) {
        return this.httpClient.put(
            this.getAlbumLink(code) + "/changerole",
            {
                profileId: profileId,
                role: +role
            },
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    sendInvite(code: string, username: string) {
        return this.httpClient.post(
            this.getAlbumLink(code) + "/invite",
            '"' + username + '"',
            {
                headers: this.identityService.getHeaders().set("Content-Type", "application/json")
            }
        );
    }

    deleteInvite(code: string, userId: number) {
        return this.httpClient.request(
            'DELETE',
            this.getAlbumLink(code) + "/invite",
            {
                headers: this.identityService.getHeaders(),
                body: userId
            }
        )
    }

    getInvites(code: string, starts?: number, count?: number) {
        let url = this.getAlbumLink(code) + '/invites?';
        if (starts != null)
            url += "starts=" + starts + "&";
        if (count != null)
            url += "count=" + count + "&";
        
        return this.httpClient.get<SuccessResponseDto<PaginationResultDto<UserInfo>>>(
            url,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }
}