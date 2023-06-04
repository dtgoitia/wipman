import { InputText as PrimeInputText } from "primereact/inputtext";
import { CSSProperties, ChangeEvent } from "react";

const EMPTY_STRING = "";

interface Props {
  id: string;
  value: string | undefined;
  label?: string;
  placeholder: string;
  large?: boolean;
  disabled?: boolean;
  fill?: boolean;
  onChange: (value: string | undefined) => void;
}

export default function InputText({
  id,
  value,
  label,
  placeholder,
  large,
  disabled,
  fill,
  onChange: change,
}: Props) {
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const value: string | undefined | null = event.target.value;

    switch (value) {
      case EMPTY_STRING:
        return change(undefined);
      case null:
        return change(undefined);
      default:
        return change(value);
    }
  }

  const style: CSSProperties = {};
  if (fill) {
    style["width"] = "100%";
  }

  const cleanValue =
    value === undefined || value === null ? EMPTY_STRING : value;

  return (
    <div style={style}>
      {label ? (
        <label className="block" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <PrimeInputText
        id={id}
        style={style}
        className={large ? "p-inputtext-lg" : ""}
        placeholder={placeholder}
        value={cleanValue}
        onChange={handleChange}
        disabled={disabled === true}
      />
    </div>
  );
}
