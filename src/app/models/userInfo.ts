export class UserInfo {
    id: number;
    username: string;
    profile: {
        firstname: string,
        lastname: string,
        backgroundCss: string
    }
    role: string;
}