import { Button } from "primereact/button";

interface Props {
  isOpen: boolean;
  onCollapse: () => void;
  children: JSX.Element;
}

export function Collapsable({ isOpen, onCollapse: collapse, children }: Props) {
  if (isOpen === false) {
    return null;
  }
  return (
    <div>
      {children}
      <Button
        label="Close"
        icon="pi pi-times"
        className="p-button-secondary"
        onClick={collapse}
      />
    </div>
  );
}
