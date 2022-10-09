import { STATUS_500_INTERNAL_SERVER_ERROR } from "./http";

export type SiemplyHandler<EVENT_TYPE, PAYLOAD> = {
    step: <NEW_PAYLOAD>(
        step: (payload: PAYLOAD) => NEW_PAYLOAD
    ) => SiemplyHandler<EVENT_TYPE, NEW_PAYLOAD>;
} & (($event: EVENT_TYPE) => APIGatewayProxyResultV2);

// TODO analyze possible cons and prons by exporting create func.
const create = <CONTEXT, PAYLOAD>(settings) => {
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
                body: $result || result[Object.keys(result).pop()],
                // TODO headers, cookies
            };

        } catch (err) {
            const {
                debug = true,
                statusCode = STATUS_500_INTERNAL_SERVER_ERROR,
                publicMessage: body = "Internal Server Error." // TODO consider about persist as consts the http body messages for errors. 
            } = err;

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
