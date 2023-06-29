import { Task, TaskId } from "../domain/types";
import styled from "styled-components";

const Container = styled.div`
  margin: 0.2rem 0;
  padding: 0 0 0 0.5rem;
  background-color: rgba(255, 255, 255, 0.02);

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: stretch;
  gap: 0.7rem;

  border-radius: 0.4rem;

  &:active {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Title = styled.div`
  order: 1;
  flex-basis: auto;
  flex-grow: 1;
  flex-shrink: 0;
  align-self: center;
  padding: 0.37rem 0;
`;

interface Props {
  task: Task;
  onOpenTaskView: () => void;
  onInsertBefore?: (args: { toInsert: TaskId; before: TaskId }) => void;
}

export default function ListedTask({ task, onOpenTaskView }: Props) {
  return (
    <Container
      style={{
        opacity: task.completed ? 0.3 : undefined,
      }}
    >
      <Title onClick={onOpenTaskView}>{task.title}</Title>
    </Container>
  );
}
