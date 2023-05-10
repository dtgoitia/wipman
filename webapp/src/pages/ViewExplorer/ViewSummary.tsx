import { Tags } from "../../components/ViewTags";
import { TaskTitle, View, ViewId } from "../../domain/types";
import { Button, Card, Dialog } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const CustomCard = styled(Card)`
  margin: 1rem;
  padding: 2rem;
`;

interface SingleViewProps {
  view: View;
  onClick: () => void;
  onDelete: (id: ViewId) => void;
}

export function ViewSummary({
  view,
  onClick: handleClick,
  onDelete: deleteView,
}: SingleViewProps) {
  const [showDeletionConfirmation, setShowDeletionConfirmation] =
    useState<boolean>(false);

  // TODO: improve `unlocked` naming
  const [isLocked, setLocked] = useState<boolean>(true);

  function handleInputChange(value: string): void {
    if (value === view.title) {
      setLocked(false);
    } else {
      setLocked(true);
    }
  }

  function handleDeleteIntent(): void {
    setShowDeletionConfirmation(false);
    deleteView(view.id);
  }

  return (
    <div>
      <Dialog
        title="Select a new date and time"
        isOpen={showDeletionConfirmation}
        autoFocus={true}
        canOutsideClickClose={true}
        isCloseButtonShown={true}
        canEscapeKeyClose={true}
        transitionDuration={0}
        onClose={() => setShowDeletionConfirmation(false)}
      >
        <div className="bp4-dialog-body">
          <h1>DANGER</h1>
          <p>
            Type <code>{view.title}</code> below to delete View:
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
      <CustomCard onClick={handleClick}>
        <Title>{view.title}</Title>
        <Tags tags={view.tags} />
        <TopTasks
          titles={[
            "feat(ui): add a thingy to the top of the stuff",
            "I'm baby wolf prism vinyl roof party. Cronut venmo viral poutine, subway tile taiyaki vape. Thundercats shoreditch cold-pressed, tilde health goth knausgaard hella. Vape street art neutra pabst.",
            `feat: ui: update NavBar to show the "Save" button on TaskManager.changes$=TaskAdded/TaskUpdated/TaskDeleted so that user can press 'Save' button and changes are propagated to browser LocalStorage and API`,
            `test: api: add test to ensure healthy endpoint breaks when DB file is missing`,
          ]}
        />
      </CustomCard>
      <Button
        icon={"trash"}
        large={true}
        onClick={() => setShowDeletionConfirmation(true)}
      >
        DELETE <em>{view.title}</em>
      </Button>
    </div>
  );
}

function TopTasks({ titles }: { titles: TaskTitle[] }) {
  if (titles.length === 0) {
    return null;
  }

  return (
    <TopTasksContainer>
      {titles.map((tag) => (
        <TopTask>{tag}</TopTask>
      ))}
    </TopTasksContainer>
  );
}
const TopTasksContainer = styled.div`
  margin-top: 0.9rem;
`;

const TopTask = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  margin-top: 0.5rem;
  opacity: 0.6;
`;
