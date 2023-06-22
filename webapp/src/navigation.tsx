import { NO_FILTER_QUERY } from "./components/SearchBox";
import { FilterQuery } from "./domain/types";
import { useSearchParams } from "react-router-dom";

const URL_QUERY_KEY = "query";

type Setter = (updated: FilterQuery) => void;

export function useUrlSearchParams(): [FilterQuery, Setter] {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = getQueryFromParams(searchParams);
  const setter = (updated: FilterQuery): void => {
    const updatedSearchParams = setQueryInParams(updated, searchParams);
    setSearchParams(updatedSearchParams);
  };

  return [query, setter];
}

function getQueryFromParams(params: URLSearchParams): FilterQuery {
  const query = params.get(URL_QUERY_KEY);
  if (query === null) {
    return NO_FILTER_QUERY;
  }

  return query;
}

function setQueryInParams(
  query: FilterQuery,
  previous: URLSearchParams
): URLSearchParams {
  let newParams = new URLSearchParams([...previous.entries()]);
  if (query === NO_FILTER_QUERY) {
    newParams.delete(URL_QUERY_KEY); // remove it from the URL
  } else {
    newParams.set(URL_QUERY_KEY, query);
  }

  return newParams;
}
