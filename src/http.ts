// TODO create & fullfill 1xx status codes
// TODO fullfill 2xx status codes
export const STATUS_200_OK = 200;
export type HttpSuccessfulResponses =
    typeof STATUS_200_OK
    ;

// TODO create & fullfill 3xx status codes
// TODO fullfill 4xx status codes
export const STATUS_400_BAD_REQUEST = 400;
export const STATUS_404_NOT_FOUND = 404;
export type HttpClientErrorResponses =
    typeof STATUS_400_BAD_REQUEST |
    typeof STATUS_404_NOT_FOUND
    ;

// TODO fullfill 5xx status codes
export const STATUS_500_INTERNAL_SERVER_ERROR = 500;
export type HttpServerErrorResponses =
    typeof STATUS_500_INTERNAL_SERVER_ERROR
    ;

export type HttpStatusCode =
    HttpSuccessfulResponses |
    HttpClientErrorResponses |
    HttpServerErrorResponses
    ;

/**
 * @TODO convert to dir, reexport, for instance:
 * /src/html
 *        - statusCodes/
 *              2xxSuccessfulResponses.ts
 *              5xxInternalServerError.ts
 */