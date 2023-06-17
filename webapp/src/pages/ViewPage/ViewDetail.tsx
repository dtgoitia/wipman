import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import InputText from "../../components/InputText";
import { TagSelector } from "../../components/TagSelector";
import { nowIsoString } from "../../domain/dates";
import { setsAreEqual } from "../../domain/set";
import { Tag, View, ViewTitle } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { Button } from "primereact/button";
import { useState } from "react";
import styled from "styled-components";

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

const StyledViewTitle = styled.div`
  margin: 1rem 0;
  display: flex;
  flex-flow: row nowrap;
  gap: 0.3rem;
`;

const ViewTitleText = styled.h2`
  display: inline;
  margin: 0;
  padding: 0;
  font-size: 2rem;
`;

interface ViewTitleProps {
  title: ViewTitle;
  onUpdate: (title: ViewTitle) => void;
}
function ViewTitleComponent({
  title: originalTitle,
  onUpdate: updateTitle,
}: ViewTitleProps) {
  const [title, setTitleLocally] = useState<ViewTitle>(originalTitle);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const isUnsaved: boolean = originalTitle !== title;

  if (isEditing === false) {
    return (
      <StyledViewTitle>
        <ViewTitleText>{title}</ViewTitleText>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => setIsEditing(true)}
        />
      </StyledViewTitle>
    );
  }

  const untitled: ViewTitle = "untitled";

  function handleChange(value: string | undefined): void {
    setTitleLocally(value === undefined ? untitled : value);
  }

  function handleSave(): void {
    setIsEditing(false);
    updateTitle(title === undefined ? untitled : title);
  }

  return (
    <StyledViewTitle>
      <InputText
        id="task-title"
        fill
        placeholder="Task title"
        value={title === untitled ? undefined : title}
        onChange={handleChange}
      />
      <Button
        icon={isUnsaved ? "pi pi-save" : "pi pi-times"}
        className="p-button-rounded p-button-text p-button-sm"
        onClick={handleSave}
      />
    </StyledViewTitle>
  );
}
