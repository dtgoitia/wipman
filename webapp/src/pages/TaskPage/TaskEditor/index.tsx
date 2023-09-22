import CenteredPage from "../../../components/CenteredPage";
import { DeleteConfirmationDialog } from "../../../components/DeleteConfirmationDialog";
import InputTextarea from "../../../components/InputTextArea";
import { LastUpdated } from "../../../components/LastUpdated";
import { TagSelector } from "../../../components/TagSelector";
import { nowIsoString } from "../../../lib/domain/dates";
import { Tag, Task, TaskId, TaskTitle } from "../../../lib/domain/types";
import { Wipman } from "../../../lib/domain/wipman";
import { setsAreEqual } from "../../../lib/set";
import Paths from "../../../routes";
import { TaskDependencies } from "./TaskDependencies";
import { TaskIdBadge } from "./TaskIdBadge";
import { Title } from "./Title";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const StyledTaskTags = styled(TagSelector)`
  padding: 0rem 4rem;
`;

const MetadataSection = styled.section`
  margin: 1rem 0;
`;
const Content = styled.section`
  margin: 1.5rem 0 2rem 0;
`;

interface Props {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: TaskId) => void;
  wipman: Wipman;
}

export function TaskEditor({
  task,
  onUpdate: updateTask,
  onDelete: deleteTask,
  wipman,
}: Props) {
  const navigateTo = useNavigate();

  const [title, setTitle] = useState<TaskTitle>(task.title);
  const [content, setContent] = useState<string>(task.content);
  const [tags, setTags] = useState<Set<Tag>>(task.tags);
  const [completed, setCompleted] = useState<boolean>(task.completed);

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
    setTitle(task.title);
    setContent(task.content);
    setTags(task.tags);
    setCompleted(task.completed);
  }

  function handleTaskDeletion(): void {
    deleteTask(task.id);
    navigateTo(Paths.tasks);
  }

  const changesSaved =
    task.title === title &&
    task.content === content &&
    setsAreEqual(task.tags, tags) &&
    task.completed === completed;

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
        <Title title={title} onUpdate={handleTaskTitleChange} />
        <TaskIdBadge id={task.id} />
        <LastUpdated date={task.updated} />
        <StyledTaskTags
          selected={tags}
          onUpdate={handleTaskTagsChange}
          wipman={wipman}
        />

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

        <TaskDependencies task={task} wipman={wipman} />

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
