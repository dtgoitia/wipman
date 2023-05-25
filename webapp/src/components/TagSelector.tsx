import { difference } from "../domain/set";
import { sortTags } from "../domain/tag";
import { Tag } from "../domain/types";
import { Wipman } from "../domain/wipman";
import SearchBox from "./SearchBox";
import { Tag as BlueprintTag, Button, Intent } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  selected: Set<Tag>;
  onUpdate: (tags: Set<Tag>) => void;
  wipman: Wipman;
}

export function TagSelector({ selected, onUpdate, wipman }: Props) {
  console.log(`TagSelector.selected:`, selected);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [all, setAll] = useState<Set<Tag>>(new Set());
  const [typed, setTyped] = useState<string>("");

  const unselected = difference(all, selected);

  const filtered = filterTags({ tags: unselected, criteria: typed });

  useEffect(() => {
    const subscription = wipman.tagManager.change$.subscribe((_) => {
      setAll(wipman.getAllTags());
    });

    setAll(wipman.getAllTags());

    return subscription.unsubscribe;
  }, [wipman]);

  function handleClick(): void {
    setIsEditing(!isEditing);
  }

  function handleTagSelected(tag: Tag): void {
    console.debug(`TagSelector.handleTagSelected::tag:`, tag);
    const updated = new Set<Tag>([...selected.values(), tag]);

    onUpdate(updated);
  }

  function handleTagUnselected(tag: Tag): void {
    console.debug(`TagSelector.handleTagUnselected::tag:`, tag);
    const updated = new Set<Tag>([...selected.values()]);
    updated.delete(tag);

    onUpdate(updated);
  }

  function handleAddNewTag(): void {
    if (typed === "") {
      throw new Error(`Cannot add new tag because there is no user input`);
    }

    wipman.addTag({ tag: typed });
  }

  if (isEditing === false) {
    return (
      <div>
        <SelectedTags tags={sortTags(selected)} />
        <Button
          icon="edit"
          disabled={false}
          intent={Intent.NONE}
          onClick={handleClick}
        >
          edit tags
        </Button>
      </div>
    );
  }

  const tagNotFound = filtered.size === 0 && typed !== "";

  return (
    <div>
      <UnselectableTags
        tags={sortTags(selected)}
        onUnselect={handleTagUnselected}
      />

      <SearchBox
        query={typed}
        placeholder="Type to filter tags..."
        onChange={(value: string) => setTyped(value)}
        clearSearch={() => setTyped("")}
        onFocus={() => {}}
      />

      <SelectableTags tags={sortTags(filtered)} onSelect={handleTagSelected} />
      <Button
        icon="collapse-all"
        disabled={false}
        intent={Intent.NONE}
        onClick={handleClick}
      >
        Close tag editor
      </Button>
      {tagNotFound && (
        <Button
          icon="add"
          disabled={false}
          intent={Intent.PRIMARY}
          onClick={handleAddNewTag}
        >
          Add tag
        </Button>
      )}
    </div>
  );
}

const TagsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  gap: 0.5rem;

  margin: 0.5rem 0;
`;

interface SelectedTagsProps {
  tags: Tag[];
}
function SelectedTags({ tags }: SelectedTagsProps) {
  return (
    <TagsContainer>
      {tags.map((tag) => (
        <BlueprintTag key={tag} large round>
          <code>{tag}</code>
        </BlueprintTag>
      ))}
    </TagsContainer>
  );
}

interface UnselectableTagsProps {
  tags: Tag[];
  onUnselect: (tag: Tag) => void;
}
function UnselectableTags({
  tags,
  onUnselect: unselectTag,
}: UnselectableTagsProps) {
  if (tags.length === 0) {
    return <p>No tags selected</p>;
  }

  return (
    <TagsContainer>
      {tags.map((tag) => (
        <BlueprintTag key={tag} large round onRemove={() => unselectTag(tag)}>
          <code>{tag}</code>
        </BlueprintTag>
      ))}
    </TagsContainer>
  );
}

interface SelectableTagsProps {
  tags: Tag[];
  onSelect: (tag: Tag) => void;
}
function SelectableTags({ tags, onSelect: select }: SelectableTagsProps) {
  if (tags.length === 0) {
    return <p>No more available tags to select</p>;
  }

  return (
    <TagsContainer>
      {tags.map((tag) => (
        <BlueprintTag key={tag} round large onClick={() => select(tag)}>
          <code>{tag}</code>
        </BlueprintTag>
      ))}
    </TagsContainer>
  );
}

function filterTags({
  tags,
  criteria,
}: {
  tags: Set<Tag>;
  criteria: string;
}): Set<Tag> {
  const result = new Set<Tag>();

  for (const tag of tags) {
    const isAMatch = tag.includes(criteria);

    if (isAMatch) {
      result.add(tag);
    }
  }

  return result;
}
/*

# Requirements

on start, user sees:
  - selected tags
  - list of the rest of the tags

if the user taps on an unselected tag, it gets selected
selected tags can be unselected by pressing the X icon

if the user types, the tags get filtered
if no tags are matched, show button for user to tap and create a new tag using the typed filter
*/
