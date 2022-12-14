import CenteredPage from "../components/CenteredPage";
import { Tag, Task, TaskId } from "../domain/types";
import taskManager from "../services/tasks";
import PageNotFound from "./PageNotFound";
import { EditableText } from "@blueprintjs/core";
import { useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

// TODO: load colors from theme
const StyledTaskTitle = styled.div`
  font-size: 2rem;
  margin: 1rem 0;
`;
interface TaskTitleProps {
  title: string;
}
function TaskTitle({ title }: TaskTitleProps) {
  return <StyledTaskTitle>{title}</StyledTaskTitle>;
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
}

function TaskDetail({ task }: TaskDetailProps) {
  const [content, setContent] = useState<string>(task.content);

  function handleContentChange(updatedContent: string): void {
    setContent(updatedContent);
  }

  function handleTaskSubmit(): void {
    // TODO: updating the whole task should be a standalone button, not just pressing enter in the text
    // TODO: probably this should do nothing, and then IF THE USER CANCELS, just revert changes
    console.log("submitting task");
    taskManager.updateTask({ ...task, content });
  }

  function discardContentChanges(): void {
    const lastSavedContent = task.content;
    setContent(lastSavedContent);
  }

  return (
    <CenteredPage>
      <MetadataSection id="metadata">
        <TaskTitle title={task.title} />
        <TaskIdBadge id={task.id} />
        {[...task.tags.values()].map((tag) => (
          <TaskTag tag={tag} />
        ))}
      </MetadataSection>
      <Content id="content">
        <EditableText
          multiline={true}
          placeholder={`Add task details here...`}
          value={content}
          onChange={handleContentChange}
          onConfirm={handleTaskSubmit} // this probably should be a button to make the UX more phone friendly
          onCancel={() => discardContentChanges()} // this probably should be a button to make the UX more phone friendly
          selectAllOnFocus={false}
        />
      </Content>
    </CenteredPage>
  );
}

function TaskPage() {
  // TODO: action: ?
  const params = useParams();
  const id = params.taskId as TaskId;

  const maybeTask = taskManager.getTask(id);

  if (maybeTask === undefined) {
    console.warn(`No task found with ID: ${id}`);
    return <PageNotFound />;
  }

  const task = maybeTask;

  return <TaskDetail task={task} />;
}

export default TaskPage;
