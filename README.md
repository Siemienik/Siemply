# Siemply
Siemply is super SIMPLE handlers framework for AWS Lambda.

```ts
export handlerCountrySingle = siemply()
    .step(findCountryStep);

// Example step construction
export handlerProvinceCollection = handlerCountrySingle.step(({country, ...payload})=>({
    ...payload,
    country, //types provided
    provinces: findAllProvinces({country:country.id})
}));

// Nesting handlers: /countries/{countryId}/provinces/{provinceId}
export handlerProvinceSingle = handlerCountrySingle.step(findProvinceInCountryStep);

// /countries/{countryId}/provinces/{provinceId}/cities
export handlerCityCollection = handlerCountrySingle.step(findCitiesInProvinceInCountryStep);
// /countries/{countryId}/provinces/{provinceId}/cities/{cityId}
export handlerCitySingle = handlerCountrySingle.step(({$event, country, province ...payload})=>({
    $event,
    ...payload,
    country,
    province,
    city: findCity($event?.queryParameters?.cityId, {countryId: country.id, provinceId: province.id}), 
}));
export handlerCityRemove = handlerCitySingle.step(({city, ...payload})=>{
    removeCity(city.id);

    return {
        ...payload,
        city, 
        $statusCode: 204
    };
);

```
## Development:

* `yarn tsc` to run builder.

## Todos:

* [ ] linter
* [ ] Jest / pure handler
* [ ] Jest / labda handler