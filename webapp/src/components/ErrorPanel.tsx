import { Wipman } from "../domain/wipman";
import { ErrorMessage } from "../services/errors";
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

interface ErrorPanelProps {
  wipman: Wipman;
}
export function ErrorPanel({ wipman }: ErrorPanelProps) {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  useEffect(() => {
    const subscription = wipman.errors.errorsFeed$.subscribe(setErrors);
    return subscription.unsubscribe;
  }, [wipman]);

  if (!errors || errors.length === 0) return null;

  return (
    <ErrorsContainer>
      <button onClick={() => wipman.errors.deleteAll()}>
        Clear all error messages
      </button>
      {errors.map((error, i) => (
        <Error key={`error-${i}`} error={error} />
      ))}
    </ErrorsContainer>
  );
}
