import { useWipman } from "../../..";
import CenteredPage from "../../../components/CenteredPage";
import { Collapsable } from "../../../components/Collapsable";
import { DeleteConfirmationDialog } from "../../../components/DeleteConfirmationDialog";
import InputTextarea from "../../../components/InputTextArea";
import { LastUpdated } from "../../../components/LastUpdated";
import { TagSelector } from "../../../components/TagSelector";
import { nowIsoString } from "../../../lib/domain/dates";
import {
  addBlockedTask,
  addBlockingTask,
  removeBlockedTask,
  removeBlockingTask,
} from "../../../lib/domain/task";
import { Tag, Task, TaskId, TaskTitle } from "../../../lib/domain/types";
import { setsAreEqual } from "../../../lib/set";
import Paths from "../../../routes";
import { Relationships } from "./Relationships";
import { TaskIdBadge } from "./TaskIdBadge";
import { Title } from "./Title";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

interface Props {
  taskId: TaskId;
  onUpdate: (task: Task) => void;
  onDelete: (id: TaskId) => void;
}

export function TaskEditor({
  taskId,
  onUpdate: updateTask,
  onDelete: deleteTask,
}: Props) {
  const navigateTo = useNavigate();
  const wipman = useWipman();

  const [task, setTask] = useState<Task | undefined>();
  const [title, setTitle] = useState<TaskTitle>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<Set<Tag>>(new Set());
  const [completed, setCompleted] = useState<boolean>(false);
  const [isMetadataVisible, setIsMetadataVisible] = useState<boolean>(false);

  useEffect(() => {
    const subscription = wipman.taskManager.change$.subscribe((change) => {
      switch (change.kind) {
        case "TaskAdded":
        // do nothing
        case "TaskUpdated":
          return setTask(wipman.getTask({ id: taskId }));
        case "TaskDeleted":
          return setTask(undefined);
      }
    });

    const task = wipman.getTask({ id: taskId });
    setTask(task);
    if (task) {
      setTitle(task.title);
      setContent(task.content);
      setTags(task.tags);
      setCompleted(task.completed);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [taskId, wipman]);

  function handleTaskTitleChange(title: TaskTitle): void {
    setTitle(title);
  }

  function handleContentChange(updatedContent: string | undefined): void {
    setContent(updatedContent === undefined ? "" : updatedContent);
  }

  function handleTaskTagsChange(tags: Set<Tag>): void {
    setTags(tags);
  }

  function handleTaskSubmit(): void {
    // TODO: updating the whole task should be a standalone button, not just pressing enter in the text
    // TODO: probably this should do nothing, and then IF THE USER CANCELS, just revert changes
    if (task === undefined) return;
    updateTask({
      ...task,
      title,
      content,
      updated: nowIsoString(),
      tags,
      completed,
    });
  }

  function discardContentChanges(): void {
    if (task === undefined) return;
    setTitle(task.title);
    setContent(task.content);
    setTags(task.tags);
    setCompleted(task.completed);
  }

  function handleTaskDeletion(): void {
    if (task === undefined) return;
    deleteTask(task.id);
    navigateTo(Paths.tasks);
  }

  function handleAddBlockedBy(blocker: TaskId): void {
    if (task === undefined) return;
    const updated = addBlockingTask({ task, blocker });
    wipman.updateTask({ task: updated });
  }

  function handleDeleteBlockedBy(blocker: TaskId): void {
    if (task === undefined) return;
    const updated = removeBlockingTask({ task, blocker });
    wipman.updateTask({ task: updated });
  }

  function handleAddBlocks(blocked: TaskId): void {
    if (task === undefined) return;
    const updated = addBlockedTask({ task, blocked });
    wipman.updateTask({ task: updated });
  }

  function handleDeleteBlocks(blocked: TaskId): void {
    if (task === undefined) return;
    const updated = removeBlockedTask({ task, blocked });
    wipman.updateTask({ task: updated });
  }

  if (task === undefined) {
    return <div>Task {taskId} does not exist</div>;
  }

  const changesSaved =
    task.title === title &&
    task.content === content &&
    setsAreEqual(task.tags, tags) &&
    task.completed === completed;

  return (
    <CenteredPage>
      <TaskHeader>
        <TaskHeaderLeft>
          <Title title={title} onUpdate={handleTaskTitleChange} />
        </TaskHeaderLeft>

        <TaskHeaderRight>
          <Button
            icon={`pi ${isMetadataVisible ? "pi-times" : "pi-bars"}`}
            className="p-button-secondary"
            onClick={() => setIsMetadataVisible(!isMetadataVisible)}
          />
        </TaskHeaderRight>
      </TaskHeader>
      {changesSaved === false && (
        <SaveChanges>
          <Button icon="floppy-disk" size="large" onClick={handleTaskSubmit}>
            Save
          </Button>
          <Button
            className="bp4-minimal"
            size="large"
            onClick={() => discardContentChanges()}
          >
            Discard
          </Button>
        </SaveChanges>
      )}

      <Collapsable
        isOpen={isMetadataVisible}
        onCollapse={() => setIsMetadataVisible(false)}
      >
        <Metadata id="metadata">
          <TaskIdBadge id={task.id} />
          <LastUpdated date={task.updated} />
          <StyledTaskTags selected={tags} onUpdate={handleTaskTagsChange} />

          <div>
            <label htmlFor="completed">
              {completed ? "task is completed" : "task is incomplete"}
            </label>
            <InputSwitch
              inputId="completed"
              checked={completed}
              onChange={() => setCompleted(!completed)}
            />
          </div>

          <Relationships
            blockedBy={task.blockedBy}
            blocks={task.blocks}
            addBlockedBy={handleAddBlockedBy}
            deleteBlockedBy={handleDeleteBlockedBy}
            addBlocks={handleAddBlocks}
            deleteBlocks={handleDeleteBlocks}
          />

          <DeleteConfirmationDialog
            title={`Do you want to delete task ${task.id}?`}
            input={task.id}
            onDelete={handleTaskDeletion}
          />
        </Metadata>
      </Collapsable>
      <Content id="content">
        <InputTextarea
          id="task-content"
          fill
          placeholder={`Add task details here...`}
          value={content}
          onChange={handleContentChange}
          style={{ height: "70vh" }}
        />
      </Content>
    </CenteredPage>
  );
}

const TaskHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: top;
  gap: 1rem;
`;

const TaskHeaderLeft = styled.div`
  flex-basis: auto;
  flex-grow: 1;
  flex-shrink: 1;
`;

const TaskHeaderRight = styled.div`
  margin-top: 1.2rem;
`;

const SaveChanges = styled.section`
  margin: 1rem 0 1.5rem 0;
`;

const StyledTaskTags = styled(TagSelector)`
  padding: 0rem 4rem;
`;

const Metadata = styled.section`
  margin: 1rem 0;
`;

const Content = styled.section`
  margin: 1rem 0 2rem 0;
`;
