import { APIGatewayProxyEventPathParameters } from "aws-lambda";
import { HttpBadRequestError } from "./errors";

/**
 * Extracting parameter from the url path. Forcing BadRequest response when the param doesn't exists.
 * 
 * @param $event AWS Lambda request event
 * @param name Path parameter's name
 * @returns {string} Value of the param
 * @throws {HttpBadRequestError} When the param doesn't exists.
 */
  export const fromPath = <EVENT_TYPE extends { pathParameters?: APIGatewayProxyEventPathParameters}>(
    $event: EVENT_TYPE,
    name: string
  ) => {
    const value = $event?.pathParameters?.[name] ?? undefined;

    if(value === undefined){
      throw new HttpBadRequestError();
    }

    return value;
  };

  // TODO add flag optional, which suppress throwing an error
  // TODO add mapper for value to map from string to any another 
  // TODO add default value
  // TODO add fromQuery, fromBody etc.
