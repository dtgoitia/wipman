import { EditableText } from "@blueprintjs/core";
import styled from "styled-components";

const Container = styled.div`
  margin: 1.3rem 0;
`;

const Label = styled.div`
  margin-left: 0.3rem;
  margin-bottom: 0.5rem;
`;

const Input = styled(EditableText)`
  margin-bottom: 0.5rem;
  display: block;
  padding: 0.3rem;
`;

interface TextFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (value?: string) => void;
  onSubmit: () => void;
}
export function TextField({
  label,
  value,
  placeholder,
  onChange,
  onSubmit,
}: TextFieldProps) {
  return (
    <Container>
      <Label>{label}</Label>
      <Input
        multiline={false}
        value={value}
        placeholder={placeholder ? placeholder : "Click to edit"}
        onChange={onChange}
        onConfirm={onSubmit}
      />
    </Container>
  );
}
