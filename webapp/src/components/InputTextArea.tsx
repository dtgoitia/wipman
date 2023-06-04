import { InputTextarea as PrimeInputTextarea } from "primereact/inputtextarea";
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
  style?: CSSProperties | undefined;
}

export default function InputTextarea({
  id,
  value,
  label,
  placeholder,
  large,
  disabled,
  fill,
  onChange: change,
  style: customStyle,
}: Props) {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>): void {
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

  let style: CSSProperties = {};
  if (fill) {
    style["width"] = "100%";
  }
  if (customStyle) {
    style = { ...style, ...customStyle };
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
      <PrimeInputTextarea
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
