import { HttpClient } from "@angular/common/http"

export const serverUrl: string = "https://picoshelter-apiserver.azurewebsites.net";
// export const serverUrl: string = "https://localhost:44384";
// export const serverUrl: string = "https://localhost:5001";
// export const serverUrl: string = "https://863d8562d7c9.eu.ngrok.io";
// export const serverUrl: string = "https://192.168.8.100:5000";

export abstract class HttpService {
    serverUrl: string = serverUrl;
    constructor(protected httpClient: HttpClient) {

    }
}