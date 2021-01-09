import { IResponseDto } from "../interfaces/IResponseDto";
import { ErrorDetailsDto } from "./errorDetailsDto";
import { ValidationErrorDto } from "./validationErrorDto";

export class ErrorResponseDto implements IResponseDto {
    success: boolean;
    error: ErrorDetailsDto;
    errors: Array<ValidationErrorDto>;
}