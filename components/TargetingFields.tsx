"use client";

import { useState } from "react";
import { useCountries } from "@/hooks/useCountries";
import { useCities } from "@/hooks/useCities";
import { useAsns } from "@/hooks/useAsns";
import SearchSelect from "./SearchSelect";
import { fieldsetClass, legendClass } from "./ui/styles";

export default function TargetingFields() {
  const [countryId, setCountryId] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [city, setCity] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [asnId, setAsnId] = useState("");
  const [asnQuery, setAsnQuery] = useState("");

  //TODO: Cache the results of the API calls using NextJS revalidation. This would allow us to avoid making repeated API calls for the same country/city/asn data, improving performance and reducing load on the server.
  const { countries, loading: countryLoading } =
    useCountries();
  const { cities, loading: cityLoading } =
    useCities(countryId);
  const { asns, loading: asnLoading } = useAsns(
    countryId,
    asnQuery,
  );

  function handleCountryChange(value: string) {
    setCountryId(value);
    setCity("");
    setCityQuery("");
    setAsnId("");
    setAsnQuery("");
  }

  return (
    <fieldset className={fieldsetClass}>
      <legend className={legendClass}>Targeting</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <SearchSelect
          id="country_search"
          name="country_id"
          label="Country"
          options={countries.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
          query={countryQuery}
          onQueryChange={setCountryQuery}
          value={countryId}
          onValueChange={handleCountryChange}
          placeholder="Any country"
          disabled={countryLoading}
          loading={countryLoading}
        />

        <SearchSelect
          id="city_search"
          name="city_alias"
          label="City"
          options={cities.map((city) => ({
            value: city.alias,
            label: city.name,
          }))}
          query={cityQuery}
          onQueryChange={setCityQuery}
          value={city}
          onValueChange={setCity}
          placeholder={
            countryId
              ? "Search cities"
              : "Select a country first"
          }
          disabled={!countryId || cityLoading}
          loading={cityLoading}
        />

        <div className="sm:col-span-2">
          <SearchSelect
            id="asn_search"
            name="asn_id"
            label="ASN"
            options={asns.map((a) => ({
              value: String(a.id),
              label: `${a.id} – ${a.name}`,
            }))}
            query={asnQuery}
            onQueryChange={setAsnQuery}
            value={asnId}
            onValueChange={setAsnId}
            placeholder={
              countryId
                ? "Search ASNs in this country"
                : "Search all ASNs (type 2+ characters)"
            }
            loading={asnLoading}
          />
        </div>
      </div>
    </fieldset>
  );
}
