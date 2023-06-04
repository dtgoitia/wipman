import { TagSelector } from "../../components/TagSelector";
import { nowIsoString } from "../../domain/dates";
import { setsAreEqual } from "../../domain/set";
import { Tag, View, ViewTitle } from "../../domain/types";
import { Wipman } from "../../domain/wipman";
import { Button, EditableText, Intent } from "@blueprintjs/core";
import { useState } from "react";
import styled from "styled-components";

interface ViewDetailProps {
  view: View;
  wipman: Wipman;
}
export function ViewDetail({ view, wipman }: ViewDetailProps) {
  const [title, setTitle] = useState<ViewTitle>(view.title);
  const [tags, setTags] = useState<Set<Tag>>(view.tags);

  function handleTaskTitleChange(title: ViewTitle): void {
    setTitle(title);
  }

  function handleViewTagsChange(tags: Set<Tag>): void {
    setTags(tags);
  }

  function discardContentChanges(): void {
    setTitle(view.title);
    setTags(view.tags);
  }

  function handleViewSubmit(): void {
    const updated: View = { ...view, title, updated: nowIsoString(), tags };
    wipman.updateView({ view: updated });
  }

  const changesSaved = view.title === title && setsAreEqual(view.tags, tags);

  return (
    <div>
      <ViewTitleComponent title={title} onUpdate={handleTaskTitleChange} />
      <TagSelector
        selected={tags}
        onUpdate={handleViewTagsChange}
        wipman={wipman}
      />
      {changesSaved === false && (
        <div>
          <Button
            icon="floppy-disk"
            large={true}
            intent={Intent.PRIMARY}
            onClick={handleViewSubmit}
          >
            Save
          </Button>
          <Button
            className="bp4-minimal"
            large={true}
            intent={Intent.NONE}
            onClick={() => discardContentChanges()}
          >
            Discard
          </Button>
        </div>
      )}
    </div>
  );
}

const StyledViewTitle = styled.div`
  font-size: 2rem;
  margin: 1rem 0;
`;
interface ViewTitleProps {
  title: ViewTitle;
  onUpdate: (title: ViewTitle) => void;
}
function ViewTitleComponent({ title, onUpdate }: ViewTitleProps) {
  return (
    <StyledViewTitle>
      <EditableText
        value={title}
        onChange={onUpdate}
        selectAllOnFocus={false}
      />
    </StyledViewTitle>
  );
}
