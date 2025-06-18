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
  onTodoDelete?: (
    todoId: Todo['id'],
    isDeleteAfterUpdate?: boolean,
  ) => Promise<void>;
  onTodoUpdate?: (
    todoId: Todo['id'],
    todoData: Partial<Todo>,
    isTitleChange?: boolean,
  ) => Promise<void>;
  editingTodoId?: Todo['id'] | null;
  setEditingTodoId?: (todoId: Todo['id'] | null) => void;
  isEditTodoFormFocused?: boolean;
  setIsEditTodoFormFocused?: (isFocused: boolean) => void;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  isTodoLoading,
  isTempTodo = false,
  onTodoDelete,
  onTodoUpdate,
  editingTodoId,
  setEditingTodoId,
  isEditTodoFormFocused,
  setIsEditTodoFormFocused,
}) => {
  const [editingTitle, setEditingTitle] = useState(todo.title);
  const editingTitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTodoId === todo.id) {
      setEditingTitle(prevTitleValue =>
        prevTitleValue === todo.title ? todo.title : prevTitleValue,
      );
      editingTitleInputRef.current?.focus();
    }
  }, [editingTodoId, todo.id, todo.title]);

  useEffect(() => {
    if (isEditTodoFormFocused && setIsEditTodoFormFocused) {
      editingTitleInputRef.current?.focus();
      setIsEditTodoFormFocused(false);
    }
  }, [isEditTodoFormFocused, setIsEditTodoFormFocused]);

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
      onTodoUpdate(todo.id, { title: trimmedEditingTitle }, true).catch(() => {
        setEditingTitle(todo.title);
      });
    } else if (onTodoDelete) {
      onTodoDelete(todo.id, true).catch(() => {
        setEditingTitle(todo.title);
      });
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
          onSubmit={event =>
            handleUpdateTodoOrDeleteIfEditingTextIsEmpty(event)
          }
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
