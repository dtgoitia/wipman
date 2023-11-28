import { useWipman } from "../..";
import { AddTask } from "../../components/AddTask";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { LastUpdated } from "../../components/LastUpdated";
import { TagSelector } from "../../components/TagSelector";
import { nowIsoString } from "../../lib/domain/dates";
import {
  Tag,
  TaskTitle,
  View,
  ViewId,
  ViewTitle,
} from "../../lib/domain/types";
import { setsAreEqual } from "../../lib/set";
import { ViewTitleComponent } from "./ViewTitle";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import styled from "styled-components";

const AlignRight = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: stretch;
`;

interface ViewDetailProps {
  viewId: ViewId;
}

export function ViewDetail({ viewId: id }: ViewDetailProps) {
  const wipman = useWipman();
  const [view, setView] = useState<View | undefined>();
  const [title, setTitle] = useState<ViewTitle | undefined>();
  const [tags, setTags] = useState<Set<Tag>>(new Set());

  useEffect(() => {
    function getView(): void {
      const view = wipman.getView({ id });
      setView(view);
      setTitle(view?.title);
      setTags(view?.tags || new Set<Tag>());
    }
    const subscription = wipman.views$.subscribe(() => getView());

    getView();

    return () => {
      subscription.unsubscribe();
    };
  }, [wipman]);

  if (view === undefined) {
    return (
      <div>
        View <code>{id}</code> not found
      </div>
    );
  }

  function handleTaskTitleChange(title: ViewTitle): void {
    setTitle(title);
  }

  function handleViewTagsChange(tags: Set<Tag>): void {
    setTags(tags);
  }

  function discardContentChanges(): void {
    if (view === undefined) {
      return;
    }

    setTitle(view.title);
    setTags(view.tags);
  }

  function handleViewSubmit(): void {
    if (view === undefined || title === undefined) {
      return;
    }

    const updated: View = { ...view, title, updated: nowIsoString(), tags };
    wipman.updateView({ view: updated });
  }

  const changesSaved = view.title === title && setsAreEqual(view.tags, tags);

  function handleAddTask(title: TaskTitle) {
    if (view === undefined) return;
    wipman.addTask({ title, tags, insertAtStart: [view.id] });
  }

  return (
    <div>
      <ViewTitleComponent
        title={title || ""}
        onUpdate={handleTaskTitleChange}
      />
      <DeleteConfirmationDialog
        title={"Confirm that you want to delete this View"}
        input={view.title}
        onDelete={() => wipman.removeView({ id: view.id })}
      />
      <LastUpdated date={view.updated} />
      <TagSelector selected={tags} onUpdate={handleViewTagsChange} />
      {changesSaved ? (
        <AddTask onAdd={handleAddTask} />
      ) : (
        <AlignRight>
          <Button icon="pi pi-plus" label="Add task" disabled={true} />
        </AlignRight>
      )}
      {changesSaved === false && (
        <div>
          <Button
            icon="pi pi-save"
            label="Save"
            onClick={handleViewSubmit}
            disabled={changesSaved}
          />
          <Button
            label={changesSaved ? "Close" : "Discard and close"}
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => discardContentChanges()}
          />
        </div>
      )}
    </div>
  );
}
