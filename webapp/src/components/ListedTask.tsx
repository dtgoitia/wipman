import { Task } from "../domain/types";
import styled from "styled-components";

const Container = styled.div`
  margin: 0.2rem 0;
  padding: 0 0 0 0.5rem;
  background-color: rgba(255, 255, 255, 0.02);

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: stretch;

  border-radius: 0.4rem;

  &:active {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Left = styled.div`
  order: 0;
  flex-basis: auto;
  flex-grow: 1;
  flex-shrink: 0;
  align-self: center;
`;

const Right = styled.div`
  order: 1000;
  flex-basis: auto;
  flex-grow: 0;
  flex-shrink: 0;
`;

interface ListedTaskProp {
  task: Task;
  onOpenTaskView: () => void;
  onRemoveTask: () => void;
}
export default function ListedTask({
  task,
  onOpenTaskView,
  onRemoveTask,
}: ListedTaskProp) {
  return (
    <Container>
      <Left onClick={onOpenTaskView}>{task.title}</Left>
      <Right>
        <button
          className="bp4-button bp4-minimal bp4-icon-trash"
          onClick={onRemoveTask}
        />
      </Right>
    </Container>
  );
}
