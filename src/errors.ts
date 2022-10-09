import { HttpStatusCode, STATUS_400_BAD_REQUEST, STATUS_404_NOT_FOUND } from "./http";

export class HttpError extends Error {
    constructor(
        public statusCode: HttpStatusCode,
        public publicMessage: string,
        public debug: boolean = false
    ) {
        super(publicMessage);
    }
}


/**
 * @description HTTP code 400: Bad Request
 */
export class HttpBadRequestError extends HttpError {
    constructor(debug = false) {
        super(STATUS_400_BAD_REQUEST, "Bad Request.", debug);
    }
}


/**
 * @description HTTP code 404: Not Found
 */
export class HttpNotFoundError extends HttpError {
    constructor(debug = false) {
        super(STATUS_404_NOT_FOUND, "Not Found.", debug);
    }
}


  // todo fullfill http errors
  