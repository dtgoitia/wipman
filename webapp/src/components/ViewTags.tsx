import { Tag } from "../domain/types";
import styled from "styled-components";

const TagsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.7rem;
`;

const StyledTag = styled.div`
  font-size: 0.8rem;
  padding: 0.4rem 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.3rem;
`;

export function Tags({ tags }: { tags: Set<Tag> }) {
  if (tags.size === 0) {
    return null;
  }

  return (
    <TagsContainer>
      {[...tags.values()].map((tag) => (
        <StyledTag key={`view-tag-${tag}`}>{tag}</StyledTag>
      ))}
    </TagsContainer>
  );
}
