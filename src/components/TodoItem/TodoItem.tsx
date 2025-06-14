/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Todo } from '../../types/todo/Todo';

const TODO_DIV_CLASSNAME = 'todo';
const TODO_REMOVE_BUTTON_CLASSNAME = 'todo__remove';
const TODO_STATUS_CHECKBOX_CLASSNAME = 'todo__status';

type Props = {
  todo: Todo;
  isTodoLoading: (todoId: Todo['id']) => boolean;
  isTempTodo?: boolean;
  onTodoDelete?: (todoId: Todo['id']) => void;
  onTodoUpdate?: (todoId: Todo['id'], todoData: Partial<Todo>) => Promise<void>;
  editingTodoId?: Todo['id'] | null;
  setEditingTodoId?: (todoId: Todo['id'] | null) => void;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  isTodoLoading,
  isTempTodo = false,
  onTodoDelete,
  onTodoUpdate,
  editingTodoId,
  setEditingTodoId,
}) => {
  const [editingTitle, setEditingTitle] = useState(todo.title);
  const editingTitleFormRef = useRef<HTMLFormElement>(null);
  const editingTitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTodoId === todo.id) {
      setEditingTitle(prevTitleValue =>
        prevTitleValue === todo.title ? todo.title : prevTitleValue,
      );
      editingTitleInputRef.current?.focus();
    }
  }, [editingTodoId, todo.id, todo.title]);

  const handleChangeTodoStatus = () => {
    if (onTodoUpdate) {
      onTodoUpdate(todo.id, { completed: !todo.completed });
    }
  };

  const handleDeleteTodo = () => {
    if (onTodoDelete) {
      onTodoDelete(todo.id);
    }
  };

  const handleDoubleClickOnTodo = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const target = event.target as HTMLElement;

    const isClickOnDeleteButton = target.closest(
      `.${TODO_REMOVE_BUTTON_CLASSNAME}`,
    );
    const isClickOnCheckbox = target.closest(
      `.${TODO_STATUS_CHECKBOX_CLASSNAME}`,
    );

    const isClickOnTodoDiv = (
      event.currentTarget as HTMLElement
    ).classList.contains(TODO_DIV_CLASSNAME);

    if (
      !isClickOnDeleteButton &&
      !isClickOnCheckbox &&
      isClickOnTodoDiv &&
      setEditingTodoId
    ) {
      setEditingTodoId(todo.id);
    }
  };

  const handleUpdateTodoOrDeleteIfEditingTextIsEmpty = (
    event?: React.FormEvent<HTMLFormElement>,
  ) => {
    if (event) {
      event.preventDefault();
    }

    const trimmedEditingTitle = editingTitle.trim();

    if (trimmedEditingTitle === todo.title && setEditingTodoId) {
      setEditingTodoId(null);

      return;
    }

    if (editingTitle && onTodoUpdate && setEditingTodoId) {
      onTodoUpdate(todo.id, { title: trimmedEditingTitle }).then(() => {
        setEditingTitle(todo.title);
        setEditingTodoId(null);
      });
    } else if (onTodoDelete) {
      onTodoDelete(todo.id);
    }
  };

  const handleFormBlur = (event: React.FocusEvent<HTMLFormElement>) => {
    const nextFocusedElement = event.relatedTarget as HTMLElement | null;

    if (!editingTitleFormRef.current?.contains(nextFocusedElement)) {
      handleUpdateTodoOrDeleteIfEditingTextIsEmpty();
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && setEditingTodoId) {
      setEditingTitle(todo.title);
      setEditingTodoId(null);
    }
  };

  return (
    <div
      data-cy="Todo"
      className={cn(TODO_DIV_CLASSNAME, { completed: todo.completed })}
      onDoubleClick={handleDoubleClickOnTodo}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className={TODO_STATUS_CHECKBOX_CLASSNAME}
          checked={todo.completed}
          onChange={handleChangeTodoStatus}
        />
      </label>

      {editingTodoId === todo.id ? (
        <form
          ref={editingTitleFormRef}
          onSubmit={event =>
            handleUpdateTodoOrDeleteIfEditingTextIsEmpty(event)
          }
          onBlur={handleFormBlur}
        >
          <input
            ref={editingTitleInputRef}
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={editingTitle}
            onChange={event => setEditingTitle(event.target.value.trimStart())}
            onBlur={() => handleUpdateTodoOrDeleteIfEditingTextIsEmpty()}
            onKeyUp={handleKeyUp}
          />
        </form>
      ) : (
        <>
          <span data-cy="TodoTitle" className="todo__title">
            {todo.title}
          </span>

          <button
            type="button"
            className={TODO_REMOVE_BUTTON_CLASSNAME}
            data-cy="TodoDelete"
            onClick={handleDeleteTodo}
            disabled={isTempTodo}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal', 'overlay', {
          'is-active': isTodoLoading?.(todo.id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
