import { Task } from "../../../lib/domain/types";
import { getTaskPath } from "../../../routes";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface RelationshipProps {
  related: Task;
  onRemove: undefined | (() => void);
}

export function Relationship({
  related,
  onRemove: handleRemove,
}: RelationshipProps) {
  return (
    <Container>
      {related.completed && <CompletedMark />}

      {related.completed ? (
        <CompletedTask to={getTaskPath(related.id)}>
          {related.title}
        </CompletedTask>
      ) : (
        <TodoTask to={getTaskPath(related.id)}>{related.title}</TodoTask>
      )}

      {handleRemove && (
        <DeleteButton
          icon="pi pi-trash"
          className="p-button-text p-button-sm"
          onClick={handleRemove}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.7rem;
  height: 2.2rem;

  background-color: rgba(122, 122, 122, 0.15);
  border-radius: 0.3rem;
  margin: 0.3rem;
  padding-left: 0.7rem;
`;

const TodoTask = styled(Link)`
  display: block;
  text-decoration: inherit;
  color: inherit;
  flex-grow: 1;
`;

const CompletedTask = styled(TodoTask)`
  opacity: 0.5;
`;

const DeleteButton = styled(Button)``;

function CompletedMark() {
  return <span>✅</span>;
}
