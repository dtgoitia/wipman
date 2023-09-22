import InputText from "../../../components/InputText";
import { TaskTitle } from "../../../lib/domain/types";
import { Button } from "primereact/button";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  margin: 1rem 0;
  display: flex;
  flex-flow: row nowrap;
  gap: 0.3rem;
`;

const TitleText = styled.h2`
  display: inline;
  margin: 0;
  padding: 0;
  font-size: 2rem;
`;

interface Props {
  title: TaskTitle;
  onUpdate: (title: TaskTitle) => void;
}
export function Title({ title: originalTitle, onUpdate: updateTitle }: Props) {
  const [title, setTitleLocally] = useState<TaskTitle>(originalTitle);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const isUnsaved: boolean = originalTitle !== title;

  if (isEditing === false) {
    return (
      <Container>
        <TitleText>{title}</TitleText>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => setIsEditing(true)}
        />
      </Container>
    );
  }

  const untitled: TaskTitle = "untitled";

  function handleChange(value: string | undefined): void {
    setTitleLocally(value === undefined ? untitled : value);
  }

  function handleSave(): void {
    setIsEditing(false);
    updateTitle(title === undefined ? untitled : title);
  }

  return (
    <Container>
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
    </Container>
  );
}
