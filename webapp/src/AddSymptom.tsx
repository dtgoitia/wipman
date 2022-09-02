import { SymptomName } from "./domain";
import { Button } from "@blueprintjs/core";
import { useState } from "react";

interface AddSymptomProps {
  add: (name: SymptomName, otherNames: SymptomName[]) => void;
}
function AddSymptom({ add }: AddSymptomProps) {
  const [name, setName] = useState<string>("");
  const [otherNames, setOtherNames] = useState<string>("");

  function handleNameChange(event: any) {
    setName(event.target.value);
  }

  function handleOtherNamesChange(event: any) {
    setOtherNames(event.target.value);
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    if (!name || name === "") return;
    add(
      name,
      otherNames.split(",").filter((otherName) => otherName)
    );
    setName("");
    setOtherNames("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Add a new symptom:</p>
      <input
        type="text"
        className={"bp4-input"}
        value={name}
        placeholder="Name"
        onChange={handleNameChange}
      />
      <input
        type="text"
        className={"bp4-input"}
        value={otherNames}
        placeholder="Other names"
        onChange={handleOtherNamesChange}
      />
      <Button intent="success" text="Add" type="submit" />
    </form>
  );
}
export default AddSymptom;
