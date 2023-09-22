import InputText from "../../components/InputText";
import { ViewTitle } from "../../lib/domain/types";
import { Button } from "primereact/button";
import { useState } from "react";
import styled from "styled-components";

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

interface Props {
  title: ViewTitle;
  onUpdate: (title: ViewTitle) => void;
}

export function ViewTitleComponent({
  title: originalTitle,
  onUpdate: updateTitle,
}: Props) {
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
