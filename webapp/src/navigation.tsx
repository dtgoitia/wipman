import { NO_FILTER_QUERY } from "./components/SearchBox";
import { FilterQuery, FilterSpec } from "./lib/domain/types";
import { useSearchParams } from "react-router-dom";

enum Key {
  query = "query",
  showCompleted = "show_completed",
}

type Setter = (updated: FilterSpec) => void;

export function useUrlSearchParams(): [FilterSpec, Setter] {
  const [searchParams, setSearchParams] = useSearchParams();

  const spec = getFilterSpec(searchParams);
  const setter = (updated: FilterSpec): void => {
    const updatedSearchParams = setFilterSpec(updated, searchParams);
    setSearchParams(updatedSearchParams);
  };

  return [spec, setter];
}

function getFilterSpec(params: URLSearchParams): FilterSpec {
  return {
    query: getQuery(params),
    showCompleted: getShowCompleted(params),
  };
}

function getQuery(params: URLSearchParams): FilterQuery {
  const rawQuery = params.get(Key.query);
  const query = rawQuery === null ? NO_FILTER_QUERY : rawQuery;
  return query;
}

function setFilterSpec(
  spec: FilterSpec,
  previous: URLSearchParams
): URLSearchParams {
  let newParams = new URLSearchParams([...previous.entries()]);

  // functions below must mutate `newParams`
  setQuery(spec.query, newParams);
  setShowCompleted(spec.showCompleted, newParams);

  return newParams;
}

function setQuery(query: FilterQuery, params: URLSearchParams): void {
  if (query === NO_FILTER_QUERY) {
    params.delete(Key.query); // remove it from the URL
  } else {
    params.set(Key.query, query);
  }
}

function getShowCompleted(params: URLSearchParams): boolean {
  return params.get(Key.showCompleted) === "true";
}

function setShowCompleted(
  showCompleted: boolean,
  previous: URLSearchParams
): void {
  if (showCompleted === true) {
    previous.set(Key.showCompleted, "true");
  } else {
    previous.delete(Key.showCompleted); // remove it from the URL
  }
}
