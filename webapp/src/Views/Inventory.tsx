import { Symptom, SymptomId } from "../domain";
import { Button, Collapse } from "@blueprintjs/core";
import styled from "styled-components";

const GrayedOut = styled.span`
  opacity: 0.3;
`;

interface SelectableItempProps {
  item: Symptom;
  onClick: (id: SymptomId) => void;
  onDelete: (id: SymptomId) => void;
}
function SelectableItem({ item, onClick, onDelete }: SelectableItempProps) {
  const otherNames = item.otherNames ? item.otherNames.join(", ") : "";
  return (
    <div>
      <Button
        onClick={() => onDelete(item.id)}
        className="bp4-button bp4-minimal"
        icon="trash"
      />
      <Button
        onClick={() => onClick(item.id)}
        className="bp4-button bp4-minimal"
      >
        <span>
          ({item.id}) {item.name} <GrayedOut>{otherNames}</GrayedOut>
        </span>
      </Button>
    </div>
  );
}
interface InventoryViewProps {
  symptoms: Symptom[];
  selectSymptom: (id: SymptomId) => void;
  removeSymptom: (id: SymptomId) => void;
  collapse: boolean;
}
function InventoryView({
  symptoms,
  selectSymptom,
  removeSymptom,
  collapse,
}: InventoryViewProps) {
  const isOpen = !collapse;
  return (
    <div>
      <Collapse isOpen={isOpen}>
        <ol>
          {symptoms.map((symptom) => {
            return (
              <SelectableItem
                key={`item-${symptom.id}`}
                item={symptom}
                onClick={selectSymptom}
                onDelete={removeSymptom}
              />
            );
          })}
        </ol>
      </Collapse>
    </div>
  );
}

export default InventoryView;
