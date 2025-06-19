/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Todo } from '../../types/todo/Todo';

type Props = {
  todo: Todo;
  isTodoLoading: (todoId: Todo['id']) => boolean;
  isTempTodo?: boolean;
  onTodoDelete?: (todoId: Todo['id']) => Promise<void>;
  onTodoUpdate?: (
    todoId: Todo['id'],
    todoData: Partial<Pick<Todo, 'title' | 'completed'>>,
  ) => Promise<void>;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  isTodoLoading,
  isTempTodo = false,
  onTodoDelete,
  onTodoUpdate,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(todo.title);
  const editingTitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      setEditingTitle(() => todo.title);
      editingTitleInputRef.current?.focus();
    }
  }, [isEditingTitle, todo.title]);

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

  const handleUpdateTodoOrDeleteIfEditingTextIsEmpty = (
    event?: React.FormEvent<HTMLFormElement>,
  ) => {
    if (event) {
      event.preventDefault();
    }

    const trimmedEditingTitle = editingTitle.trim();

    if (trimmedEditingTitle === todo.title) {
      setIsEditingTitle(false);

      return;
    }

    if (trimmedEditingTitle && onTodoUpdate) {
      onTodoUpdate(todo.id, { title: trimmedEditingTitle })
        .then(() => {
          setIsEditingTitle(false);
        })
        .catch(() => {
          setEditingTitle(todo.title);
        });
    } else if (onTodoDelete) {
      onTodoDelete(todo.id)
        .then(() => {
          setIsEditingTitle(false);
        })
        .catch(() => {
          setEditingTitle(todo.title);
        });
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setEditingTitle(todo.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      data-cy="Todo"
      className={cn('todo', { completed: todo.completed })}
      onDoubleClick={() => setIsEditingTitle(true)}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={handleChangeTodoStatus}
        />
      </label>

      {isEditingTitle ? (
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
            className="todo__remove"
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
