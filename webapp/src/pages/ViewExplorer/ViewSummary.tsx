import { Tag, Task, TaskTitle, View, ViewId } from "../../domain/types";
import { Card } from "@blueprintjs/core";
import styled from "styled-components";

interface SingleViewProps {
  view: View;
  onOpenView: (id: ViewId) => void;
}
export function ViewSummary({ view, onOpenView: openView }: SingleViewProps) {
  return (
    <CustomCard onClick={() => openView(view.id)}>
      <Title>{view.title}</Title>
      <Tags tags={view.tags} />
      <TopTasks
        titles={[
          "feat(ui): add a thingy to the top of the stuff",
          "I'm baby wolf prism vinyl roof party. Cronut venmo viral poutine, subway tile taiyaki vape. Thundercats shoreditch cold-pressed, tilde health goth knausgaard hella. Vape street art neutra pabst.",
          `feat: ui: update NavBar to show the "Save" button on TaskManager.changes$=TaskAdded/TaskUpdated/TaskDeleted so that user can press 'Save' button and changes are propagated to browser LocalStorage and API`,
          `test: api: add test to ensure healthy endpoint breaks when DB file is missing`,
        ]}
      />
    </CustomCard>
  );
}

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const CustomCard = styled(Card)`
  margin: 1rem;
  padding: 2rem;
`;

function Tags({ tags }: { tags: Set<Tag> }) {
  if (tags.size === 0) {
    return null;
  }

  return (
    <TagsContainer>
      {[...tags.values()].map((tag) => (
        <StyledTag>{tag}</StyledTag>
      ))}
    </TagsContainer>
  );
}

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

function TopTasks({ titles }: { titles: TaskTitle[] }) {
  if (titles.length === 0) {
    return null;
  }

  return (
    <TopTasksContainer>
      {titles.map((tag) => (
        <TopTask>{tag}</TopTask>
      ))}
    </TopTasksContainer>
  );
}
const TopTasksContainer = styled.div`
  margin-top: 0.9rem;
`;

const TopTask = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  margin-top: 0.5rem;
  opacity: 0.6;
`;
