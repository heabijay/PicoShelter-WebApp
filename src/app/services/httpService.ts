import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"

export const serverUrl: string = "https://localhost:5001";

@Injectable()
export class HttpService {
    serverUrl: string = serverUrl;
    constructor(public httpClient: HttpClient) {

    }
}