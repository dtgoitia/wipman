import { sortTags } from "../lib/domain/tag";
import { Tag } from "../lib/domain/types";
import { Wipman } from "../lib/domain/wipman";
import { difference } from "../lib/set";
// import "./MultiSelectDemo.css";
import SearchBox from "./SearchBox";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
// import { MultiSelect } from "primereact/multiselect";
import { useEffect, useState } from "react";
import styled from "styled-components";

interface Props {
  selected: Set<Tag>;
  onUpdate: (tags: Set<Tag>) => void;
  wipman: Wipman;
}

export function TagSelector({ selected, onUpdate, wipman }: Props) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [all, setAll] = useState<Set<Tag>>(new Set());
  const [typed, setTyped] = useState<string | undefined>();

  const unselected = difference(all, selected);

  const filtered = filterTags({ tags: unselected, criteria: typed });

  useEffect(() => {
    const subscription = wipman.tagManager.change$.subscribe(() => {
      setAll(wipman.getAllTags());
    });

    setAll(wipman.getAllTags());

    return () => subscription.unsubscribe();
  }, [wipman]);

  function handleClickOnOpenCloseButton(): void {
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
    if (typed === undefined || typed === "") {
      throw new Error(`Cannot add new tag because there is no user input`);
    }

    wipman.addTag({ tag: typed });
  }

  if (isEditing === false) {
    return (
      <div style={{ display: "flex", flexFlow: "row nowrap", gap: "0.5rem" }}>
        <Button
          icon="pi pi-pencil"
          disabled={false}
          className="p-button-secondary p-button-rounded p-button-sm"
          onClick={handleClickOnOpenCloseButton}
        />
        <SelectedTags tags={sortTags(selected)} />
      </div>
    );
  }

  const tagNotFound = filtered.size === 0 && typed !== "";

  return (
    <div>
      <Button
        icon={"pi pi-times"}
        disabled={false}
        className="p-button-rounded p-button-sm"
        onClick={handleClickOnOpenCloseButton}
      />

      <UnselectableTags
        tags={sortTags(selected)}
        onUnselect={handleTagUnselected}
      />

      <SearchBox
        query={typed}
        placeholder="Type to filter tags..."
        onChange={(value) => setTyped(value)}
        clearSearch={() => setTyped("")}
      />

      <SelectableTags tags={sortTags(filtered)} onSelect={handleTagSelected} />
      {tagNotFound && (
        <Button
          icon="add"
          disabled={false}
          className="p-button-secondary"
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
        <Chip key={`selected-tag-${tag}`} label={tag} className="mr-2 mb-2" />
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
        <Chip
          key={tag}
          label={tag}
          className="mr-2 mb-2"
          removable
          onRemove={() => unselectTag(tag)}
        />
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
        <Chip
          key={tag}
          label={tag}
          className="mr-2 mb-2"
          onClick={() => select(tag)}
        />
      ))}
    </TagsContainer>
  );
}

function filterTags({
  tags,
  criteria,
}: {
  tags: Set<Tag>;
  criteria: string | undefined;
}): Set<Tag> {
  if (criteria === undefined) {
    return tags;
  }

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
