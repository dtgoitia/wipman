import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { TagSelector } from "../../components/TagSelector";
import { nowIsoString } from "../../domain/dates";
import { setsAreEqual } from "../../domain/set";
import { Tag, View, ViewTitle } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { ViewTitleComponent } from "./ViewTitle";
import { Button } from "primereact/button";
import { useState } from "react";

interface ViewDetailProps {
  view: View;
  wipman: Wipman;
}
export function ViewDetail({ view, wipman }: ViewDetailProps) {
  const [title, setTitle] = useState<ViewTitle>(view.title);
  const [tags, setTags] = useState<Set<Tag>>(view.tags);

  function handleTaskTitleChange(title: ViewTitle): void {
    setTitle(title);
  }

  function handleViewTagsChange(tags: Set<Tag>): void {
    setTags(tags);
  }

  function discardContentChanges(): void {
    setTitle(view.title);
    setTags(view.tags);
  }

  function handleViewSubmit(): void {
    const updated: View = { ...view, title, updated: nowIsoString(), tags };
    wipman.updateView({ view: updated });
  }

  const changesSaved = view.title === title && setsAreEqual(view.tags, tags);

  return (
    <div>
      <ViewTitleComponent title={title} onUpdate={handleTaskTitleChange} />
      <DeleteConfirmationDialog
        title={"Confirm that you want to delete this View"}
        input={view.title}
        onDelete={() => wipman.removeView({ id: view.id })}
      />
      <TagSelector
        selected={tags}
        onUpdate={handleViewTagsChange}
        wipman={wipman}
      />
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
