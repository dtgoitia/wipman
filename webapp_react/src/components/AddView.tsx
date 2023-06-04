import { ViewTitle } from "../domain/types";
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

interface AddViewProps {
  onAdd: (title: ViewTitle) => void;
}
function AddView({ onAdd }: AddViewProps) {
  const [viewTitleInputIsOpen, openViewTitleInput] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");

  function handleSubmit() {
    if (title) {
      onAdd(title);
    } else {
      console.debug("View title not provided, aborting view creation");
    }
    setTitle("");
    openViewTitleInput(false);
  }

  if (viewTitleInputIsOpen) {
    return (
      <Container>
        <EditableText
          multiline={true}
          placeholder={`Add view title here...`}
          value={title}
          onChange={setTitle}
          onConfirm={handleSubmit}
          onCancel={() => openViewTitleInput(false)}
          selectAllOnFocus={true}
        />
        <AlignLeft>
          <button
            className="bp4-button bp4-large bp4-icon-add"
            onClick={handleSubmit}
          >
            Add view
          </button>
        </AlignLeft>
      </Container>
    );
  }

  return (
    <AlignLeft>
      <button
        className="bp4-button bp4-large bp4-icon-add"
        onClick={() => openViewTitleInput(true)}
      >
        Add view
      </button>
    </AlignLeft>
  );
}

export default AddView;
