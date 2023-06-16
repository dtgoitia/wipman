import SearchBox, { NO_FILTER_QUERY } from "../../components/SearchBox";
import { FilterQuery } from "../../domain/types";
import { InputSwitch } from "primereact/inputswitch";

export interface FilterSpec {
  query: FilterQuery;
  showCompleted: boolean;
}

interface Props {
  spec: FilterSpec;
  onUpdate: (spec: FilterSpec) => void;
}
export function TaskFilter({ spec, onUpdate: update }: Props) {
  function handleFilterChange(query: FilterQuery | undefined): void {
    update({
      ...spec,
      query: query === undefined ? NO_FILTER_QUERY : query,
    });
  }

  function handleClearSearch(): void {
    update({
      ...spec,
      query: NO_FILTER_QUERY,
    });
  }

  function handleShowCompletedSwitchChange(): void {
    update({
      ...spec,
      showCompleted: !spec.showCompleted,
    });
  }

  return (
    <>
      <SearchBox
        query={spec.query}
        placeholder="Filter tasks..."
        onChange={handleFilterChange}
        clearSearch={handleClearSearch}
      />

      <div>
        <label htmlFor="show-completed-tasks">
          {spec.showCompleted
            ? "showing completed tasks"
            : "hiding completed tasks"}
        </label>
        <InputSwitch
          inputId="show-completed-tasks"
          checked={spec.showCompleted}
          onChange={handleShowCompletedSwitchChange}
        />
      </div>
    </>
  );
}
