import { ValidationErrors } from "@angular/forms";
import { IResponseDto } from "../interfaces/IResponseDto";

export class ErrorResponseDto implements IResponseDto {
    success: boolean;
    error: string;
    errors: ValidationErrors[];
}