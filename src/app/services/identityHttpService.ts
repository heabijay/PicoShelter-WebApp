import { Injectable } from "@angular/core";
import { HttpService } from "../abstract/httpService";
import { UserLoginDto } from "../models/userLoginDto";
import { UserLoginByEmailDto } from "../models/userLoginByEmailDto";
import { TokenService } from "./tokenService";
import { UserInfo } from "../models/userInfo";
import { SuccessResponseDto } from "../models/successResponseDto";
import { HttpClient } from "@angular/common/http"
import { UserRegistrationDto } from "../models/userRegistrationDto";
import { UserChangePasswordDto } from "../models/userChangePasswordDto";
import { PaginationResultDto } from "../models/paginationResultDto";
import { UserAlbumInviteDto } from "../models/userAlbumInviteDto";


@Injectable()
export class IdentityHttpService extends HttpService {
    protected subPath = "/api/Auth";

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    login(userLoginDto: UserLoginDto) {
        return this.httpClient.post(
            this.serverUrl + this.subPath + "/login",
            userLoginDto
        );
    }

    loginByEmail(userLoginByEmailDto: UserLoginByEmailDto) {
        return this.httpClient.post(
            this.serverUrl + this.subPath + "/elogin",
            userLoginByEmailDto
        );
    }

    register(userRegistrationDto: UserRegistrationDto) {
        return this.httpClient.post(
            this.serverUrl + this.subPath + "/register",
            userRegistrationDto
        );
    }

    getCurrentUser() {
        return this.httpClient.get<SuccessResponseDto<UserInfo>>(
            this.serverUrl + this.subPath + "/getInfo",
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    changePassword(changePasswordDto: UserChangePasswordDto) {
        return this.httpClient.put(
            this.serverUrl + this.subPath + "/changepassword",
            changePasswordDto,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    getEmail() {
        return this.httpClient.get<SuccessResponseDto<string>>(
            this.serverUrl + this.subPath + "/email",
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    changeEmail(newEmail: string) {
        return this.httpClient.put(
            this.serverUrl + this.subPath + "/changeemail",
            '"' + newEmail + '"',
            {
                headers: this.identityService.getHeaders().set("Content-Type", "application/json")
            }
        )
    }

    resetPassword(email: string) {
        return this.httpClient.post(
            this.serverUrl + this.subPath + "/resetpassword",
            '"' + email + '"',
            {
                headers: this.identityService.getHeaders().set("Content-Type", "application/json")
            }
        )
    }

    getAlbumInvites(starts?: number, count?: number) {
        let url = this.serverUrl + this.subPath + "/getAlbumInvites?";
        if (starts != null)
            url += "starts=" + starts + "&";
        if (count != null)
            url += "count=" + count + "&";
        
        return this.httpClient.get<SuccessResponseDto<PaginationResultDto<UserAlbumInviteDto>>>(
            url,
            {
                headers: this.identityService.getHeaders()
            }
        );
    }
}