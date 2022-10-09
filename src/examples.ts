import type {
    APIGatewayProxyEventV2WithLambdaAuthorizer,
    APIGatewayProxyResultV2
} from "aws-lambda";

/// examples
type UserContext = { userId: string };
const requestEvent = {
    version: "1",
    routeKey: "/asda/",
    rawPath: "/asdas/asda/",
    rawQueryString: "?sasasa=sasas",
    headers: {},
    requestContext: {
        authorizer: { lambda: { userId: "1" } },
        accountId: "",
        apiId: "",
        domainName: "",
        domainPrefix: "",
        http: {
            method: "",
            path: "",
            protocol: "",
            sourceIp: "",
            userAgent: ""
        },
        requestId: "",
        routeKey: "",
        stage: "",
        time: "",
        timeEpoch: 0
    },
    isBase64Encoded: false
};
type WithAuthorizer = APIGatewayProxyEventV2WithLambdaAuthorizer<UserContext>;

const empty = siemply<WithAuthorizer>();
console.log("empty", empty(requestEvent));

const withMiddleweres = siemply<WithAuthorizer>()
    .step((payload) => ({
        ...payload,
        test1: "123"
    }))
    .step((payload) => ({
        ...payload,
        b: "123"
    }))
    .step((payload) => ({
        ...payload,
        a1: "123"
    }))
    .step((payload) => ({
        ...payload,
        test4: "123"
    }))
    .step((payload) => ({
        ...payload,
        a: `${payload.test1}+${payload.test4}+${payload.b}+${payload.a1}`,
        $statusCode: 201
    }));
console.log("withMiddleweres", withMiddleweres(requestEvent));

const withEmptyMiddleweres = siemply<WithAuthorizer>().step((payload) => ({
    ...payload,
    $statusCode: 204
}));
console.log("withEmptyMiddleweres", withEmptyMiddleweres(requestEvent));

const withAnError = siemply<WithAuthorizer>().step((payload) => {
    throw new Error("an error");
});
console.log("withAnError", withAnError(requestEvent));

const notFound = siemply<WithAuthorizer>().step((payload) => {
    throw new NotFoundError();
});
console.log("notFound", notFound(requestEvent));

const badRequest = siemply<WithAuthorizer>().step((payload) => {
    throw new BadRequestError();
});
console.log("badRequest", badRequest(requestEvent));

/// nested - live example

// countries db:
type Country = {
    name: string;
    id: string;
    detail: string;
};
const countriesDb: Country[] = [
    {
        name: "Poland",
        id: "7f3607ad-92e0-4369-bdf9-c141a1ca3fd4",
        detail: "it is a detail"
    },
    {
        name: "United Kingdom",
        id: "15d8f931-337e-4781-8aad-0893c34a9c1a",
        detail: "it is a detail"
    }
];

// get Countries
const getCountries = () => {
    return countriesDb.map<Omit<Country, "detail">>((x) => {
        const { detail, ...country } = x;
        return country;
    });
};

// /countries
const countriesCollectionGet = siemply<WithAuthorizer>().step((payload) => ({
    ...payload,
    countries: getCountries()
}));

console.log("Get countries list", countriesCollectionGet(requestEvent));

// get specific Country

const getCountry = (id: string) => {
    const country = countriesDb.find((x) => x.id === id);
    if (!country) {
        throw new NotFoundError();
    }
    return country;
};

// /countries/{countryId}
const countriesSingleGet = siemply<WithAuthorizer>().step((payload) => ({
    ...payload,
    country: getCountry(pathParam(payload.$event, "countryId"))
}));

console.log(
    "Get Poland details (no id provided)",
    countriesSingleGet(requestEvent)
);
console.log(
    "Get Poland details (incorrect id provided)",
    countriesSingleGet({
        ...requestEvent,
        pathParameters: { countryId: "there is not id like that" }
    })
);
console.log(
    "Get Poland details",
    countriesSingleGet({
        ...requestEvent,
        pathParameters: { countryId: "7f3607ad-92e0-4369-bdf9-c141a1ca3fd4" }
    })
);

// provinces db:
const provincesDb = [
    {
        id: "9cd507a9-c4f2-4f73-9ce3-86deede5aaf5",
        name: "woj. śląskie",
        countryId: "7f3607ad-92e0-4369-bdf9-c141a1ca3fd4"
    },
    {
        id: "9cd507a9-c4f2-4f73-9ce3-86deede5aaf6",
        name: "woj. małopolskie",
        countryId: "7f3607ad-92e0-4369-bdf9-c141a1ca3fd4"
    },
    {
        id: "9cd507a9-c4f2-4f73-9ce3-86deede5aaf7",
        name: "South East",
        countryId: "15d8f931-337e-4781-8aad-0893c34a9c1a"
    }
];

// get Provinces of country
const getProvinces = (country: Country) => {
    return provincesDb.filter((x) => x.countryId === country.id);
};

// /countries/{countryId}/provinces
const provincesCollectionGet = countriesSingleGet.step((payload) => ({
    ...payload,
    provinces: getProvinces(payload.country)
}));

console.log(
    "400: Get provinces of Poland details (no id provided)",
    provincesCollectionGet(requestEvent)
);
console.log(
    "404: Get provinces of Poland details (incorrect id provided)",
    provincesCollectionGet({
        ...requestEvent,
        pathParameters: { countryId: "there is not id like that" }
    })
);
console.log(
    "200: Get provinces of Poland details",
    provincesCollectionGet({
        ...requestEvent,
        pathParameters: { countryId: "7f3607ad-92e0-4369-bdf9-c141a1ca3fd4" }
    })
);

// get Provinces of country
const getProvince = (country: Pick<Country, "id">, id: string) => {
    const province = provincesDb.find(
        (x) => x.countryId === country.id && x.id === id
    );
    if (!province) {
        throw new NotFoundError();
    }
    return province;
};

// /countries/{countryId}/provinces
const provincesSingleGet = countriesSingleGet.step((payload) => ({
    ...payload,
    province: getProvince(
        payload.country,
        pathParam(payload.$event, "provinceId")
    )
}));
console.log(
    "200: Get province details",
    provincesSingleGet({
        ...requestEvent,
        pathParameters: {
            countryId: "7f3607ad-92e0-4369-bdf9-c141a1ca3fd4",
            provinceId: "9cd507a9-c4f2-4f73-9ce3-86deede5aaf6"
        }
    })
);
console.log(
    "404: Get province details (when province exists but it is not from the country)",
    provincesSingleGet({
        ...requestEvent,
        pathParameters: {
            countryId: "9cd507a9-c4f2-4f73-9ce3-86deede5aaf7",
            provinceId: "9cd507a9-c4f2-4f73-9ce3-86deede5aaf6"
        }
    })
);
console.log(
    "400: Get province details (when country id is not provided)",
    provincesSingleGet({
        ...requestEvent,
        pathParameters: {
            provinceId: "9cd507a9-c4f2-4f73-9ce3-86deede5aaf6"
        }
    })
);
console.log(
    "400: Get province details (when province id is not provided)",
    provincesSingleGet({
        ...requestEvent,
        pathParameters: {
            countryId: "7f3607ad-92e0-4369-bdf9-c141a1ca3fd4"
        }
    })
);
console.log(
    "404: Get province details (when province id is provided but incorrect)",
    provincesSingleGet({
        ...requestEvent,
        pathParameters: {
            countryId: "7f3607ad-92e0-4369-bdf9-c141a1ca3fd4",
            provinceId: "there is no id like that"
        }
    })
);
console.log(
    "404: Get province details (when country id is provided but incorrect)",
    provincesSingleGet({
        ...requestEvent,
        pathParameters: {
            countryId: "there is no id like that",
            provinceId: "9cd507a9-c4f2-4f73-9ce3-86deede5aaf6"
        }
    })
);
