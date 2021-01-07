import { ValidationErrors } from "@angular/forms";
import { IResponseDto } from "../interfaces/IResponseDto";
import { ErrorDetailsDto } from "./errorDetailsDto";

export class ErrorResponseDto implements IResponseDto {
    success: boolean;
    error: ErrorDetailsDto;
    errors: ValidationErrors[];
}