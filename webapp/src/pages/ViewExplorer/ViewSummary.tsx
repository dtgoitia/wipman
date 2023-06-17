import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { Tags } from "../../components/ViewTags";
import { Task, TaskTitle, View, ViewId } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { Card } from "primereact/card";
import styled from "styled-components";

const TASK_AMOUNT = 5; // Amount of tasks shown in the View summary

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
  wipman: Wipman;
}
export function ViewSummary({
  view,
  onClick: handleClick,
  onDelete: deleteView,
  wipman,
}: Props) {
  const titles: TaskTitle[] = view.tasks
    .slice(0, TASK_AMOUNT)
    .map((taskId) => wipman.getTask({ id: taskId }) as Task)
    .map((task) => task.title);

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
        <TopTasks titles={titles} />
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
