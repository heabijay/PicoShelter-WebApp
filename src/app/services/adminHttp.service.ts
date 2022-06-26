import { Injectable } from "@angular/core";
import { HttpService } from "../abstract/httpService";
import { TokenService } from "./token.service";
import { HttpClient } from "@angular/common/http"
import { ImageInfoDto } from "../models/imageInfoDto"
import { SuccessResponseDto } from "../models/successResponseDto"
import { StatsModel } from "../apanel/models/statsModel";
import { Observable } from "rxjs";
import { ImageShortInfoDto } from "../models/imageShortInfoDto";
import { PaginationResultDto } from "../models/paginationResultDto";
import { ReportMessageModel } from "../apanel/models/reportMessageModel";


@Injectable()
export class AdminHttpService extends HttpService {
    protected subPath = "/api/apanel";

    constructor(protected httpClient: HttpClient, private identityService: TokenService) {
        super(httpClient);
    }

    getStats() {
        return this.httpClient.get<SuccessResponseDto<StatsModel>>(
            this.serverUrl + this.subPath + "/stats",
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    getImageInfo(code: string) {
        return this.httpClient.get<SuccessResponseDto<ImageInfoDto>>(
            this.serverUrl + this.subPath + "/getImage/" + code,
            {
                headers: this.identityService.getHeaders()
            }
        );
    }

    getImageBlob(code: string, ext: string) : Observable<Blob> {
        return this.httpClient.get(
            this.serverUrl + this.subPath + "/getImage/" + code + "." + ext,
            {
                headers: this.identityService.getHeaders(),
                responseType: "blob"
            }
        );
    }

    deleteImage(code: string) {
        return this.httpClient.delete(
            this.serverUrl + this.subPath + "/deleteImage/" + code,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }


    getReports(starts?: number, count?: number) {
        let url = this.serverUrl + this.subPath + '/reports?';
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

    getReportMessages(imageId: number, starts?: number, count?: number) {
        let url = this.serverUrl + this.subPath + '/report/' + imageId + '?';
        if (starts != null)
            url += "starts=" + starts + "&";
        if (count != null)
            url += "count=" + count + "&";
        
        return this.httpClient.get<SuccessResponseDto<PaginationResultDto<ReportMessageModel>>>(
            url,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }

    postReportProcessed(imageId : number) {
        return this.httpClient.post(
            this.serverUrl + this.subPath + '/report/' + imageId + '/process',
            null,
            {
                headers: this.identityService.getHeaders()
            }
        )
    }
}