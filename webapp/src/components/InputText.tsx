import { toDomainValue, toInputValue } from "../textInputHelpers";
import { InputText as PrimeInputText } from "primereact/inputtext";
import { CSSProperties, ChangeEvent } from "react";

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
  value: domainValue,
  label,
  placeholder,
  large,
  disabled,
  fill,
  onChange: change,
}: Props) {
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const inputValue = event.target.value;
    change(toDomainValue(inputValue));
  }

  const style: CSSProperties = {};
  if (fill) {
    style["width"] = "100%";
  }

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
        value={toInputValue(domainValue)}
        onChange={handleChange}
        disabled={disabled === true}
      />
    </div>
  );
}
