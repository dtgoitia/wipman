import CenteredPage from "../components/CenteredPage";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import InputText from "../components/InputText";
import InputTextarea from "../components/InputTextArea";
import { TagSelector } from "../components/TagSelector";
import { nowIsoString } from "../domain/dates";
import { setsAreEqual } from "../domain/set";
import { Tag, Task, TaskId, TaskTitle } from "../domain/types";
import { Wipman, WipmanStatus } from "../domain/wipman";
import { assertNever } from "../exhaustive-match";
import Paths from "../routes";
import PageNotFound from "./PageNotFound";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

const StyledTaskTitle = styled.div`
  margin: 1rem 0;
  display: flex;
  flex-flow: row nowrap;
  gap: 0.3rem;
`;

const TaskTitleText = styled.h2`
  display: inline;
  margin: 0;
  padding: 0;
  font-size: 2rem;
`;

interface TaskTitleProps {
  title: TaskTitle;
  onUpdate: (title: TaskTitle) => void;
}
function TaskTitleComponent({
  title: originalTitle,
  onUpdate: updateTitle,
}: TaskTitleProps) {
  const [title, setTitleLocally] = useState<TaskTitle>(originalTitle);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const isUnsaved: boolean = originalTitle !== title;

  if (isEditing === false) {
    return (
      <StyledTaskTitle>
        <TaskTitleText>{title}</TaskTitleText>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => setIsEditing(true)}
        />
      </StyledTaskTitle>
    );
  }

  const untitled: TaskTitle = "untitled";

  function handleChange(value: string | undefined): void {
    setTitleLocally(value === undefined ? untitled : value);
  }

  function handleSave(): void {
    setIsEditing(false);
    updateTitle(title === undefined ? untitled : title);
  }

  return (
    <StyledTaskTitle>
      <InputText
        id="task-title"
        fill
        placeholder="Task title"
        value={title === untitled ? undefined : title}
        onChange={handleChange}
      />
      <Button
        icon={isUnsaved ? "pi pi-save" : "pi pi-times"}
        className="p-button-rounded p-button-text p-button-sm"
        onClick={handleSave}
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

const StyledTaskTags = styled(TagSelector)`
  padding: 0rem 4rem;
`;

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
  wipman: Wipman;
}

function TaskDetail({
  task,
  onUpdate: updateTask,
  onDelete: deleteTask,
  wipman,
}: TaskDetailProps) {
  const navigateTo = useNavigate();

  const [title, setTitle] = useState<TaskTitle>(task.title);
  const [content, setContent] = useState<string>(task.content);
  const [tags, setTags] = useState<Set<Tag>>(task.tags);

  function handleContentChange(updatedContent: string | undefined): void {
    setContent(updatedContent === undefined ? "" : updatedContent);
  }

  function handleTaskTitleChange(title: TaskTitle): void {
    setTitle(title);
  }

  function handleTaskTagsChange(tags: Set<Tag>): void {
    setTags(tags);
  }

  function handleTaskSubmit(): void {
    // TODO: updating the whole task should be a standalone button, not just pressing enter in the text
    // TODO: probably this should do nothing, and then IF THE USER CANCELS, just revert changes
    updateTask({ ...task, title, content, updated: nowIsoString(), tags });
  }

  function discardContentChanges(): void {
    setTitle(task.title);
    setContent(task.content);
    setTags(task.tags);
  }

  function handleTaskDeletion(): void {
    deleteTask(task.id);
    navigateTo(Paths.tasks);
  }

  const changesSaved =
    task.title === title &&
    task.content === content &&
    setsAreEqual(task.tags, tags);

  return (
    <CenteredPage>
      <MetadataSection id="metadata">
        {changesSaved === false && (
          <div>
            <Button
              icon="floppy-disk"
              size="large"
              // intent={Intent.PRIMARY}
              onClick={handleTaskSubmit}
            >
              Save
            </Button>
            <Button
              className="bp4-minimal"
              size="large"
              // intent={Intent.NONE}
              onClick={() => discardContentChanges()}
            >
              Discard
            </Button>
          </div>
        )}
        <TaskTitleComponent title={title} onUpdate={handleTaskTitleChange} />
        <TaskIdBadge id={task.id} />
        <StyledTaskTags
          selected={tags}
          onUpdate={handleTaskTagsChange}
          wipman={wipman}
        />
        <DeleteConfirmationDialog
          title={`Do you want to delete task ${task.id}?`}
          input={task.id}
          onDelete={handleTaskDeletion}
        />
      </MetadataSection>
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
    case WipmanStatus.UpdateViewInApiStarted:
      return false;
    case WipmanStatus.UpdateViewInApiCompleted:
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

    return () => subscription.unsubscribe();
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
      wipman={wipman}
    />
  );
}

export default TaskPage;
