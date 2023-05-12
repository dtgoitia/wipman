import { Button, Dialog } from "@blueprintjs/core";
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
        title={title}
        isOpen={dialogShown}
        autoFocus={true}
        canOutsideClickClose={true}
        isCloseButtonShown={true}
        canEscapeKeyClose={true}
        transitionDuration={0}
        onClose={() => showDialog(false)}
      >
        <div className="bp4-dialog-body">
          <h1>DANGER</h1>
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
        <div className="bp4-dialog-footer">
          <Button
            disabled={isLocked}
            intent={"danger"}
            icon={"trash"}
            large={true}
            onClick={handleDeleteIntent}
          >
            DELETE
          </Button>
        </div>
      </Dialog>
      <Button icon={"trash"} large={true} onClick={() => showDialog(true)}>
        DELETE
      </Button>
    </div>
  );
}
