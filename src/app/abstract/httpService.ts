import { HttpClient } from "@angular/common/http"

export const serverUrl: string = "https://localhost:5000";
// export const serverUrl: string = "https://863d8562d7c9.eu.ngrok.io";
// export const serverUrl: string = "http://192.168.8.100:5000";

export abstract class HttpService {
    serverUrl: string = serverUrl;
    constructor(protected httpClient: HttpClient) {

    }
}