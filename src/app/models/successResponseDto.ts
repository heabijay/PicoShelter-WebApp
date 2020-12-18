import { IResponseDto } from "../interfaces/IResponseDto";

export class SuccessResponseDto<T> implements IResponseDto {
    success: boolean;
    data: T;
}