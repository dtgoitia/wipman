import { Task } from "../../../lib/domain/types";
import { getTaskPath } from "../../../routes";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface RelationshipProps {
  related: Task;
  onRemove: () => void;
}

export function Relationship({
  related,
  onRemove: handleRemove,
}: RelationshipProps) {
  return (
    <RelationshipContainer>
      <Link to={getTaskPath(related.id)}>{related.title}</Link>

      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-sm"
        onClick={handleRemove}
      />
    </RelationshipContainer>
  );
}

const RelationshipContainer = styled.div`
  border: 1px solid #333;
  margin: 0.5rem;
`;
