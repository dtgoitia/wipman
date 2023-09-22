import { Task, TaskId } from "../lib/domain/types";
import { useDrag, useDrop } from "react-dnd";
import styled from "styled-components";

const DRAGABLE_TASK = "draggable_task";

interface DraggedItemReference {
  draggedTaskId: TaskId;
}

const Container = styled.div`
  margin: 0.2rem 0;
  padding: 0 0 0 0.5rem;
  background-color: rgba(255, 255, 255, 0.02);

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: stretch;
  gap: 0.7rem;

  border-radius: 0.4rem;

  &:active {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Handle = styled.div`
  order: 0;
  flex-basis: 1rem;
  flex-grow: 0;
  flex-shrink: 0;
  align-self: center;
  padding: 0;

  &:hover {
    cursor: grab;
  }
`;

const Title = styled.div`
  order: 1;
  flex-basis: auto;
  flex-grow: 1;
  flex-shrink: 0;
  align-self: center;
  padding: 0.37rem 0;
`;

interface Props {
  task: Task;
  onOpenTaskView: () => void;
  onInsertBefore?: (args: { toInsert: TaskId; before: TaskId }) => void;
}

export function DraggableListedTask({
  task,
  onOpenTaskView,
  onInsertBefore: insertBefore,
}: Props) {
  const { id } = task;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAGABLE_TASK,
    item: { draggedTaskId: id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: DRAGABLE_TASK,
      drop: (draggetItem) => {
        if (insertBefore === undefined) return;
        const { draggedTaskId } = draggetItem as DraggedItemReference;
        insertBefore({ toInsert: draggedTaskId, before: task.id });
      },
      collect: (monitor) => ({ isOver: !!monitor.isOver() }),
    }),
    [id]
  );

  const allowDrag = insertBefore !== undefined;
  const containerRef = allowDrag ? drop : undefined;
  const draggableRef = allowDrag ? drag : undefined;

  return (
    <Container
      ref={containerRef}
      style={{
        border: isOver
          ? "1px yellow solid"
          : isDragging
          ? "1px blue solid"
          : undefined,
        opacity: task.completed ? 0.3 : undefined,
      }}
    >
      <Handle ref={draggableRef}> {isDragging ? "<---" : ":::"} </Handle>

      <Title onClick={onOpenTaskView}>{task.title}</Title>
    </Container>
  );
}
