import { TaskId } from "../../../lib/domain/types";
import styled from "styled-components";

// TODO: load colors from theme
const StyledTaskId = styled.code`
  margin: 0 0.5rem;
`;
interface Props {
  id: TaskId;
}
export function TaskIdBadge({ id }: Props) {
  return <StyledTaskId>#{id}</StyledTaskId>;
}
