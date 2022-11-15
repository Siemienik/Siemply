import {siemply} from "@siemply/aws-lambda"
import {HttpBadRequestError} from "@siemply/aws-lambda/errors"

const handler = siemply();
const handler2 = siemply().step(()=>{throw new HttpBadRequestError();})

console.log(handler2());