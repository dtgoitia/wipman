import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { Tags } from "../../components/ViewTags";
import { TaskTitle, View, ViewId } from "../../domain/types";
import { Card } from "primereact/card";
import styled from "styled-components";

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding: 0;
`;

const CustomCard = styled(Card)`
  margin: 1rem;
`;

interface Props {
  view: View;
  onClick: () => void;
  onDelete: (id: ViewId) => void;
}
export function ViewSummary({
  view,
  onClick: handleClick,
  onDelete: deleteView,
}: Props) {
  return (
    <CustomCard
      footer={
        <DeleteConfirmationDialog
          title={"Confirm that you want to delete this View"}
          input={view.title}
          onDelete={() => deleteView(view.id)}
        />
      }
    >
      <div onClick={handleClick}>
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
      </div>
    </CustomCard>
  );
}

function TopTasks({ titles }: { titles: TaskTitle[] }) {
  if (titles.length === 0) {
    return null;
  }

  return (
    <TopTasksContainer>
      {titles.map((tag) => (
        <TopTask key={`top-task-${tag}`}>{tag}</TopTask>
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
