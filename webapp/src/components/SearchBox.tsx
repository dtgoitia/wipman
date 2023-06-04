import { FilterQuery } from "../domain/types";
import { InputText as PrimeInputText } from "primereact/inputtext";
import { ChangeEvent } from "react";
import styled from "styled-components";

export const NO_FILTER_QUERY = "";

interface Props {
  query: FilterQuery | undefined;
  onChange: (query: FilterQuery | undefined) => void;
  clearSearch: () => void;
  placeholder: string;
}

function SearchBox({
  placeholder,
  query,
  onChange: onFilterQueryChange,
  clearSearch,
}: Props) {
  const showDeleteIcon = query && query.length > 0;

  return (
    <span
      className={
        showDeleteIcon
          ? "p-input-icon-left p-input-icon-right"
          : "p-input-icon-left"
      }
    >
      <i className="pi pi-search" />

      <PrimeInputText
        className="p-inputtext-lg"
        placeholder={placeholder}
        value={query}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onFilterQueryChange(event.target.value)
        }
      />

      {showDeleteIcon && (
        <ClickableIcon className="pi pi-times" onClick={() => clearSearch()} />
      )}
    </span>
  );
}

export default SearchBox;

const ClickableIcon = styled.i`
  &:hover {
    cursor: pointer;
  }
`;
