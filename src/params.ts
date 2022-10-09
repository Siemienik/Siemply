/**
 * Extracting parameter from the url path. Forcing BadRequest response when the param doesn't exists.
 * 
 * @param $event AWS Lambda request event
 * @param name Path parameter's name
 * @returns {string} Value of the param
 * @throws {HttpBadRequestError} When the param doesn't exists.
 */
  export const fromPath = <EVENT_TYPE extends { pathParameters?: {[k:string] : string} }>(
    $event: EVENT_TYPE,
    name: string
  ) => {
    if (
      !Object.prototype.hasOwnProperty.call($event?.pathParameters ?? {}, name)
    ) {
      throw new HttpBadRequestError();
    }
    return $event.pathParameters[name];
  };

  // TODO add flag optional, which suppress throwing an error
  // TODO add mapper for value to map from string to any another 
  // TODO add default value
  // TODO add fromQuery, fromBody etc.
  