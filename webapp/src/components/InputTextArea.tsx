import { toDomainValue, toInputValue } from "../textInputHelpers";
import { InputTextarea as PrimeInputTextarea } from "primereact/inputtextarea";
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
  style?: CSSProperties | undefined;
}

export default function InputTextarea({
  id,
  value: domainValue,
  label,
  placeholder,
  large,
  disabled,
  fill,
  onChange: change,
  style: customStyle,
}: Props) {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const inputValue = event.target.value;
    change(toDomainValue(inputValue));
  }

  let style: CSSProperties = {};
  if (fill) {
    style["width"] = "100%";
  }
  if (customStyle) {
    style = { ...style, ...customStyle };
  }

  return (
    <div style={style}>
      {label ? (
        <label className="block" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <PrimeInputTextarea
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
