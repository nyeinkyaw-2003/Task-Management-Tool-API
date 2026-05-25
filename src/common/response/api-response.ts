export class ApiResponse<T> {
    success: boolean = true;
    message: string = '';
    data?: T | null;
    meta?: any;

    constructor(partial: Partial<ApiResponse<T>>) {
        Object.assign(this, partial);
    }

    static success<T>(
        data: T, 
        message = "Success", 
        meta?: any
    ): ApiResponse<T> {
        return new ApiResponse<T>({
            success: true,
            message,
            data,
            meta
        })
    }
}