import { Task, TaskTitle, View } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { Card } from "primereact/card";
import styled from "styled-components";

const TASK_AMOUNT = 5; // Amount of tasks shown in the View summary

const CustomCard = styled(Card)`
  margin: 1rem;
`;

interface Props {
  view: View;
  onClick: () => void;
  wipman: Wipman;
}

export function ViewSummary({ view, onClick: handleClick, wipman }: Props) {
  const titles: TaskTitle[] = view.tasks
    .map((taskId) => wipman.getTask({ id: taskId }) as Task)
    .filter((task) => task !== undefined && task.completed === false)
    .slice(0, TASK_AMOUNT)
    .map((task) => task.title);

  return (
    <CustomCard onClick={handleClick} title={view.title}>
      <TopTasks titles={titles} />
    </CustomCard>
  );
}

const TopTask = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  margin-top: 0.5rem;
  opacity: 0.6;
`;

function TopTasks({ titles }: { titles: TaskTitle[] }) {
  if (titles.length === 0) {
    return null;
  }

  return (
    <div>
      {titles.map((tag) => (
        <TopTask key={`top-task-${tag}`}>{tag}</TopTask>
      ))}
    </div>
  );
}
