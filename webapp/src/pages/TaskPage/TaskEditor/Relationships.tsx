import { useWipman } from "../../..";
import { Task, TaskId } from "../../../lib/domain/types";
import { Wipman } from "../../../lib/domain/wipman";
import { AddRelation } from "./AddRelation";
import { Relationship } from "./Relationship";
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

  const blockedByTasks: Task[] = getTasks({ ids: [...blockedBy], wipman });
  const blocksTasks: Task[] = getTasks({ ids: [...blocks], wipman });

  return (
    <Container>
      <SectionHeader>Blocked by</SectionHeader>
      <SectionBody>
        {blockedByTasks.map((task) => (
          <Relationship
            key={task.id}
            related={task}
            onRemove={() => deleteBlockedBy(task.id)}
          />
        ))}
        <AddRelation text="add blocking task" onAdd={addBlockedBy} />
      </SectionBody>

      <SectionHeader>Blocks</SectionHeader>
      <SectionBody>
        {blocksTasks.map((task) => (
          <Relationship
            key={task.id}
            related={task}
            onRemove={() => deleteBlocks(task.id)}
          />
        ))}
        <AddRelation text="add blocked" onAdd={addBlocks} />
      </SectionBody>
    </Container>
  );
}

const Container = styled.div`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

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
