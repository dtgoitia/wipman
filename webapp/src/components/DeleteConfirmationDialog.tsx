import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useState } from "react";

interface Props {
  title: string;
  input: string; // can only delete if user types this
  onDelete: () => void;
}
export function DeleteConfirmationDialog({ title, input, onDelete }: Props) {
  const [dialogShown, showDialog] = useState<boolean>(false);
  const [isLocked, lock] = useState<boolean>(true);

  function handleInputChange(value: string): void {
    if (value === input) {
      lock(false);
    } else {
      lock(true);
    }
  }

  function handleDeleteIntent(): void {
    showDialog(false);
    onDelete();
  }

  return (
    <div>
      <Dialog
        header={title}
        visible={dialogShown}
        dismissableMask
        footer={
          <Button
            className="p-button-danger"
            icon={"pi pi-trash"}
            onClick={handleDeleteIntent}
            disabled={isLocked}
            label="DELETE"
          />
        }
        onHide={() => showDialog(false)}
      >
        <div className="bp4-dialog-body">
          <p>
            Type <code>{input}</code> below to delete View:
          </p>
          <input
            className="bp4-input bp4-fill"
            type="text"
            placeholder="Text input"
            dir="auto"
            onChange={(event) => handleInputChange(event.target.value)}
          />
        </div>
      </Dialog>

      <Button
        icon={"pi pi-trash"}
        label="DELETE"
        onClick={() => showDialog(true)}
      />
    </div>
  );
}
