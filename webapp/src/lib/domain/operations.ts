import { generateHash } from "./hash";
import { Observable, Subject } from "rxjs";

export type OperationId = string;
type OperationStatus = "ongoing" | "ended";
export type OperationStatusChange =
  | { kind: "operation.started"; id: OperationId }
  | { kind: "operation.ended"; id: OperationId };

/**
 * Tracks inflight and completed operations in a central place.
 * Use cases: show spinners in UI, etc.
 */
export class OperationsManager {
  public operations: Map<OperationId, OperationStatus>;
  public change$: Observable<OperationStatusChange>;
  private changeSubject: Subject<OperationStatusChange>;
  constructor() {
    this.operations = new Map<OperationId, OperationStatus>();
    this.changeSubject = new Subject<OperationStatusChange>();
    this.change$ = this.changeSubject.asObservable();

    this.change$.subscribe((change) =>
      console.debug(`OperationsManager.construction::change:`, change)
    );
  }

  public start(id: OperationId | undefined = undefined): OperationId {
    const opId: OperationId = id || generateOperationId();
    this.operations.set(opId, "ongoing");
    this.changeSubject.next({ kind: "operation.started", id: opId });
    return opId;
  }

  public end({ operationId: id }: { operationId: OperationId }): void {
    this.operations.set(id, "ended");
    this.changeSubject.next({ kind: "operation.ended", id });
  }
}

export function generateOperationId(): OperationId {
  return `op_${generateHash()}`;
}
