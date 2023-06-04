import { TaskTitle } from "../domain/types";
import InpuText from "./InputText";
import { Button } from "primereact/button";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  margin-top: 0.8rem;

  width: 100%;
`;

const AlignRight = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: stretch;
`;

interface AddTaskProps {
  onAdd: (title: TaskTitle) => void;
}
function AddTask({ onAdd }: AddTaskProps) {
  const [taskTitleInputIsOpen, openTaskTitleInput] = useState<boolean>(false);
  const [title, setTitle] = useState<string | undefined>();

  function handleSubmit() {
    if (title) {
      onAdd(title);
    } else {
      console.debug("Task title not provided, aborting task creation");
    }
    setTitle(undefined);
    openTaskTitleInput(false);
  }

  const canSubmit = title !== undefined && title !== "";

  if (taskTitleInputIsOpen) {
    return (
      <Container>
        <InpuText
          id="add-task-input"
          value={title}
          placeholder="Add task title here..."
          fill
          onChange={setTitle}
        />
        <AlignRight>
          <Button
            icon="pi pi-plus"
            label="Add task"
            onClick={handleSubmit}
            disabled={!canSubmit}
          />
          <Button
            label={canSubmit ? "Discard and close" : "Close"}
            icon="pi pi-times"
            className="p-button-secondary"
            onClick={() => openTaskTitleInput(false)}
          />
        </AlignRight>
      </Container>
    );
  }

  return (
    <AlignRight>
      <Button
        label="Add task"
        icon="pi pi-plus"
        className="p-button-secondary"
        onClick={() => openTaskTitleInput(true)}
      />
    </AlignRight>
  );
}

export default AddTask;
