import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { HttpError } from "./errors";
import { STATUS_200_OK, STATUS_500_INTERNAL_SERVER_ERROR } from "./http";

export type SiemplyHandler<EVENT_TYPE, PAYLOAD> = {
    step: <NEW_PAYLOAD>(
        step: (payload: PAYLOAD) => NEW_PAYLOAD
    ) => SiemplyHandler<EVENT_TYPE, NEW_PAYLOAD>;
} & (($event: EVENT_TYPE) => APIGatewayProxyResultV2);

const create = <CONTEXT, PAYLOAD>(settings: {
    steps:any[] // it's quite hard to properly write the type for thisone, that why I use any. It's could be accepted as it's internal function.
}) => {
    const steps = settings.steps;

    const handler: SiemplyHandler<CONTEXT, PAYLOAD> = (event) => {
        if (steps.length === 0) {
            return {
                statusCode: STATUS_200_OK,
                body: `Siemply is simple! Now try to add some steps ;-)`
            };
        }
        try {
            const { $statusCode, $result, $event, ...result } = steps.reduce(
                (payload, step) => ({ ...payload, ...step(payload) }),
                { $event: event }
            );

            return {
                statusCode: $statusCode || STATUS_200_OK,
                body: $result || result[Object.keys(result).pop() as keyof typeof result],
                // TODO headers, cookies. Followed by: @see https://github.com/Siemienik/Siemply/issues/3
            };

        } catch (err) {
            const {
                debug = true,
                statusCode = STATUS_500_INTERNAL_SERVER_ERROR,
                publicMessage: body = "Internal Server Error." // TODO consider about persist as consts the http body messages for errors. 
            } = err as HttpError; // TODO redesign: It is not always HttpError. It could be just an Error, for that case is not too bad beacuse then the default values will be provided. However, in JS non Object variable could be thrown (it's edge-case for instance err could be a string).

            if (debug) {
                console.error(err);
            }

            return {
                statusCode,
                body
            };
        }
    };

    handler.step = <NEW_PAYLOAD>(
        step: (payload: PAYLOAD) => NEW_PAYLOAD
    ): SiemplyHandler<CONTEXT, NEW_PAYLOAD> =>
        create<CONTEXT, NEW_PAYLOAD>({ ...settings, steps: [...steps, step] });

    return handler;
};

/// public interface
export const siemply =
    <EVENT_TYPE>() => create<EVENT_TYPE, { $event: EVENT_TYPE }>({ steps: [] });
