import { ERRORS } from "@algo-builder/web";
import { assert } from "chai";

import { TasksDSL } from "../../../../src/internal/core/tasks/dsl";
import { expectBuilderErrorAsync } from "../../../helpers/errors";

describe("TasksDSL", () => {
  let dsl: TasksDSL;
  beforeEach(() => {
    dsl = new TasksDSL();
  });

  it("should add a task", () => {
    const taskName = "compile";
    const description = "compiler task description";
    const action = async (): Promise<void> => {};

    const task = dsl.task(taskName, description, action);

    assert.equal(task.name, taskName);
    assert.equal(task.description, description);
    assert.equal(task.action, action);
    assert.isFalse(task.isInternal);
  });

  it("should add an internal task", () => {
    const action = async (): Promise<void> => {};
    const task = dsl.internalTask(
      "compile",
      "compiler task description",
      action
    );
    assert.isTrue(task.isInternal);
  });

  it("should add a task without description", () => {
    const action = async (): Promise<void> => {};
    const task = dsl.task("compile", action);
    assert.isUndefined(task.description);
    assert.equal(task.action, action);
  });

  it("should add a task with default action", async () => {
    const task = dsl.task("compile", "a description");
    assert.isDefined(task.description);
    assert.isDefined(task.action);

    const runSuperNop: any = async (): Promise<void> => {};
    runSuperNop.isDefined = false;

    await expectBuilderErrorAsync(
      async () => await task.action({}, {} as any, runSuperNop),
      ERRORS.TASK_DEFINITIONS.ACTION_NOT_SET
    );
  });

  it("should override task", () => {
    const action = async (): Promise<void> => {};

    const builtin = dsl.task("compile", "built-in", action);
    let tasks = dsl.getTaskDefinitions();
    assert.equal(tasks.compile, builtin);

    const custom = dsl.task("compile", "custom", action);
    tasks = dsl.getTaskDefinitions();
    assert.equal(tasks.compile, custom);
  });

  it("should return added tasks", () => {
    const task = dsl.task("compile", "built-in");
    const tasks = dsl.getTaskDefinitions();
    assert.deepEqual(tasks, { compile: task });
  });
});
