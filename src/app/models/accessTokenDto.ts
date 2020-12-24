export class AccessTokenDto {
    constructor(
        public access_token: string,
        public access_token_expires: Date
    ) {  
    }
}