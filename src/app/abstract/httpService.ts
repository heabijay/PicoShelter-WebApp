import { HttpClient } from "@angular/common/http"

export const serverUrl: string = "https://localhost:5001";

export abstract class HttpService {
    serverUrl: string = serverUrl;
    constructor(protected httpClient: HttpClient) {

    }
}