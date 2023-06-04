import { TaskTitle } from "../domain/types";
import { EditableText } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  margin-top: 0.8rem;

  width: 100%;
`;

const AlignLeft = styled.div`
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
  const [title, setTitle] = useState<string>("");

  function handleSubmit() {
    if (title) {
      onAdd(title);
    } else {
      console.debug("Task title not provided, aborting task creation");
    }
    setTitle("");
    openTaskTitleInput(false);
  }

  if (taskTitleInputIsOpen) {
    return (
      <Container>
        <EditableText
          multiline={true}
          placeholder={`Add task title here...`}
          value={title}
          onChange={setTitle}
          onConfirm={handleSubmit}
          onCancel={() => openTaskTitleInput(false)}
          selectAllOnFocus={true}
        />
        <AlignLeft>
          <button
            className="bp4-button bp4-large bp4-icon-add"
            onClick={handleSubmit}
          >
            Add task
          </button>
        </AlignLeft>
      </Container>
    );
  }

  return (
    <AlignLeft>
      <button
        className="bp4-button bp4-large bp4-icon-add"
        onClick={() => openTaskTitleInput(true)}
      >
        Add task
      </button>
    </AlignLeft>
  );
}

export default AddTask;
