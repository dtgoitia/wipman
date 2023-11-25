import { useWipman } from "..";
import { ErrorMessage } from "../services/errors";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface ErrorProps {
  error: ErrorMessage;
}

function Error({ error: { header, description } }: ErrorProps) {
  return (
    <div>
      <h4>{header}</h4>
      <pre>{description}</pre>
    </div>
  );
}

const ErrorsContainer = styled.div`
  margin: 0.2rem;
`;

interface ErrorPanelProps {}

export function ErrorPanel({}: ErrorPanelProps) {
  const wipman = useWipman();
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  useEffect(() => {
    const subscription = wipman.errors.errorsFeed$.subscribe(setErrors);
    return () => subscription.unsubscribe();
  }, [wipman]);

  if (!errors || errors.length === 0) return null;

  return (
    <ErrorsContainer>
      <Button
        onClick={() => wipman.errors.deleteAll()}
        label="Clear all error messages"
      />
      {errors.map((error, i) => (
        <Error key={`error-${i}`} error={error} />
      ))}
    </ErrorsContainer>
  );
}
