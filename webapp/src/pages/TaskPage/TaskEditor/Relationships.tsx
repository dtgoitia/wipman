import { useWipman } from "../../..";
import { Task, TaskId } from "../../../lib/domain/types";
import { Wipman } from "../../../lib/domain/wipman";
import { AddRelation } from "./AddRelation";
import { Relationship } from "./Relationship";
import { InputSwitch } from "primereact/inputswitch";
import { useState } from "react";
import styled from "styled-components";

interface Props {
  blockedBy: Set<TaskId>;
  addBlockedBy: (id: TaskId) => void;
  deleteBlockedBy: (id: TaskId) => void;

  blocks: Set<TaskId>;
  addBlocks: (id: TaskId) => void;
  deleteBlocks: (id: TaskId) => void;
}

export function Relationships({
  blockedBy,
  blocks,
  addBlockedBy,
  deleteBlockedBy,
  addBlocks,
  deleteBlocks,
}: Props) {
  const wipman = useWipman();

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const blockedByTasks: Task[] = getTasks({ ids: [...blockedBy], wipman });
  const blocksTasks: Task[] = getTasks({ ids: [...blocks], wipman });

  return (
    <Container>
      <ToggleContainer>
        <ToggleLabel htmlFor="completed">
          edit mode is {isEditing ? "ON" : "OFF"}
        </ToggleLabel>
        <InputSwitch
          inputId="completed"
          checked={isEditing}
          onChange={() => setIsEditing(!isEditing)}
        />
      </ToggleContainer>

      <SectionHeader>Blocked by</SectionHeader>
      <SectionBody>
        {isEditing && (
          <AddRelation text="add blocking task" onAdd={addBlockedBy} />
        )}

        {blockedByTasks.map((task) => (
          <Relationship
            key={task.id}
            related={task}
            onRemove={isEditing ? () => deleteBlockedBy(task.id) : undefined}
          />
        ))}
      </SectionBody>

      <SectionHeader>Blocks</SectionHeader>
      <SectionBody>
        {isEditing && <AddRelation text="add blocked" onAdd={addBlocks} />}

        {blocksTasks.map((task) => (
          <Relationship
            key={task.id}
            related={task}
            onRemove={isEditing ? () => deleteBlocks(task.id) : undefined}
          />
        ))}
      </SectionBody>
    </Container>
  );
}

const Container = styled.div`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const ToggleContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
`;

const ToggleLabel = styled.label``;

const SectionHeader = styled.h4`
  margin-top: 0.5rem;
  margin-bottom: 0.4rem;
`;

const SectionBody = styled.div`
  padding-left: 1rem;
`;

function getTasks({ ids, wipman }: { ids: TaskId[]; wipman: Wipman }): Task[] {
  const result: Task[] = [];

  for (const id of ids) {
    const task = wipman.taskManager.getTask(id);
    if (task === undefined) continue;
    result.push(task);
  }

  return result;
}
