import CenteredPage from "../components/CenteredPage";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { nowIsoString } from "../domain/dates";
import { Tag, Task, TaskId, TaskTitle } from "../domain/types";
import { Wipman, WipmanStatus } from "../domain/wipman";
import { assertNever } from "../exhaustive-match";
import Paths from "../routes";
import PageNotFound from "./PageNotFound";
import { Button, EditableText, Intent } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

// TODO: load colors from theme
const StyledTaskTitle = styled.div`
  font-size: 2rem;
  margin: 1rem 0;
`;
interface TaskTitleProps {
  title: TaskTitle;
  onUpdate: (title: TaskTitle) => void;
}
function TaskTitleComponent({ title, onUpdate }: TaskTitleProps) {
  return (
    <StyledTaskTitle>
      <EditableText
        value={title}
        onChange={onUpdate}
        selectAllOnFocus={false}
      />
    </StyledTaskTitle>
  );
}

// TODO: load colors from theme
const StyledTaskId = styled.code`
  margin: 0 0.5rem;
`;
interface TaskIdProps {
  id: TaskId;
}
function TaskIdBadge({ id }: TaskIdProps) {
  return <StyledTaskId>#{id}</StyledTaskId>;
}

// TODO: load colors from theme
const StyledTaskTag = styled.code`
  background-color: #aaa;
  color: #555;
  padding: 0.3rem 0.4rem;
  margin: 0 0.3rem;
  border-radius: 0.4rem;
`;
interface TaskTagProps {
  tag: Tag;
}
function TaskTag({ tag }: TaskTagProps) {
  return <StyledTaskTag>{tag}</StyledTaskTag>;
}

const MetadataSection = styled.section`
  margin: 1rem 0;
`;
const Content = styled.section`
  margin: 1.5rem 0 2rem 0;
`;

interface TaskDetailProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: TaskId) => void;
}

function TaskDetail({
  task,
  onUpdate: updateTask,
  onDelete: deleteTask,
}: TaskDetailProps) {
  const navigateTo = useNavigate();

  const [title, setTitle] = useState<TaskTitle>(task.title);
  const [content, setContent] = useState<string>(task.content);

  function handleContentChange(updatedContent: string): void {
    setContent(updatedContent);
  }

  function handleTaskTitleChange(title: TaskTitle): void {
    setTitle(title);
  }

  function handleTaskSubmit(): void {
    // TODO: updating the whole task should be a standalone button, not just pressing enter in the text
    // TODO: probably this should do nothing, and then IF THE USER CANCELS, just revert changes
    updateTask({ ...task, title, content, updated: nowIsoString() });
  }

  function discardContentChanges(): void {
    setContent(task.title);
    setContent(task.content);
  }

  function handleTaskDeletion(): void {
    deleteTask(task.id);
    navigateTo(Paths.tasks);
  }

  const changesSaved = task.title === title && task.content === content;

  return (
    <CenteredPage>
      <MetadataSection id="metadata">
        {changesSaved === false && (
          <div>
            <Button
              icon="floppy-disk"
              large={true}
              intent={Intent.PRIMARY}
              onClick={handleTaskSubmit}
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
        <TaskTitleComponent title={title} onUpdate={handleTaskTitleChange} />
        <TaskIdBadge id={task.id} />
        {[...task.tags.values()].map((tag) => (
          <TaskTag tag={tag} />
        ))}
        <DeleteConfirmationDialog
          title={`Do you want to delete task ${task.id}?`}
          input={task.id}
          onDelete={handleTaskDeletion}
        />
      </MetadataSection>
      <Content id="content">
        <EditableText
          multiline={true}
          placeholder={`Add task details here...`}
          value={content}
          onChange={handleContentChange}
          onCancel={() => discardContentChanges()}
          selectAllOnFocus={false}
        />
      </Content>
    </CenteredPage>
  );
}

function isLoading(status: WipmanStatus): boolean {
  switch (status) {
    case WipmanStatus.InitStarted:
      return true;
    case WipmanStatus.InitCompleted:
      return false;
    case WipmanStatus.BackendLoadStarted:
      return false;
    case WipmanStatus.BackendLoadCompleted:
      return false;
    case WipmanStatus.BrowserLoadCompleted:
      return false;
    case WipmanStatus.BrowserLoadStarted:
      return false;
    case WipmanStatus.AddTaskInApiStarted:
      return true;
    case WipmanStatus.AddTaskInApiCompleted:
      return false;
    case WipmanStatus.UpdateTaskInApiStarted:
      return true;
    case WipmanStatus.UpdateTaskInApiCompleted:
      return false;
    case WipmanStatus.DeleteTaskInApiStarted:
      return true;
    case WipmanStatus.DeleteTaskInApiCompleted:
      return false;
    case WipmanStatus.AddViewInStoreStarted:
      return false;
    case WipmanStatus.AddViewInStoreCompleted:
      return false;
    case WipmanStatus.RemoveViewFromStoreStarted:
      return false;
    case WipmanStatus.RemoveViewFromStoreCompleted:
      return false;
    default:
      assertNever(status, `Unsupported WipmanStatus variant: ${status}`);
  }
}

interface TaskPageProps {
  wipman: Wipman;
}
function TaskPage({ wipman }: TaskPageProps) {
  const [loading, setLoading] = useState<boolean>(true);

  // TODO: action: ?
  const params = useParams();
  const id = params.taskId as TaskId;

  useEffect(() => {
    const subscription = wipman.status$.subscribe((status) => {
      setLoading(isLoading(status));
    });

    const status = wipman.lastStatus;
    if (status) {
      setLoading(isLoading(status));
    }

    return subscription.unsubscribe;
  }, [wipman]);

  if (loading === true) {
    return <div>LOADING TASK</div>;
  }

  function handleTaskUpdate(task: Task): void {
    wipman.updateTask({ task });
  }

  function handleTaskDeletion(id: TaskId): void {
    wipman.removeTask(id);
  }

  const maybeTask = wipman.getTask({ id });

  if (maybeTask === undefined) {
    console.warn(`No task found with ID: ${id}`);
    return <PageNotFound />;
  }

  const task = maybeTask;

  return (
    <TaskDetail
      task={task}
      onUpdate={handleTaskUpdate}
      onDelete={handleTaskDeletion}
    />
  );
}

export default TaskPage;
