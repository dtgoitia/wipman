import { Button } from "primereact/button";

function refreshPage() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Location/reload
  // `.reload(true)` is supported in Firefox and Chrome, but it's not standard
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.location.reload(true);
}

function ReloadPageButton() {
  return (
    <Button
      type="button"
      icon="pi pi-refresh"
      onClick={refreshPage}
      label="Reload app"
    />
  );
}

export default ReloadPageButton;
