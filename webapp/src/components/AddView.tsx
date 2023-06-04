import { ViewTitle } from "../domain/types";
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

interface AddViewProps {
  onAdd: (title: ViewTitle) => void;
}
function AddView({ onAdd }: AddViewProps) {
  const [viewTitleInputIsOpen, openViewTitleInput] = useState<boolean>(false);
  const [title, setTitle] = useState<string | undefined>();

  function handleSubmit() {
    if (title) {
      onAdd(title);
    } else {
      console.debug("View title not provided, aborting view creation");
    }
    setTitle(undefined);
    openViewTitleInput(false);
  }

  const canSubmit = title !== undefined && title !== "";

  if (viewTitleInputIsOpen) {
    return (
      <Container>
        <InpuText
          id="add-view-input"
          value={title}
          placeholder="Add view title here..."
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
            onClick={() => openViewTitleInput(false)}
          />
        </AlignRight>
      </Container>
    );
  }

  return (
    <AlignRight>
      <Button
        label="Add view"
        icon="pi pi-plus"
        className="p-button-secondary"
        onClick={() => openViewTitleInput(true)}
      />
    </AlignRight>
  );
}

export default AddView;
