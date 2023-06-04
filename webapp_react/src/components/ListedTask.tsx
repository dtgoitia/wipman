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
  padding: 0.37rem 0;
`;

interface ListedTaskProp {
  task: Task;
  onOpenTaskView: () => void;
}
export default function ListedTask({ task, onOpenTaskView }: ListedTaskProp) {
  return (
    <Container>
      <Left onClick={onOpenTaskView}>{task.title}</Left>
    </Container>
  );
}
