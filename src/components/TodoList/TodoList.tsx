/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { Todo } from '../../types/todo/Todo';
import { TodoItem } from '../TodoItem';

type Props = {
  todos: Todo[];
  tempTodo: Todo | null;
  isTodoLoading: (todoId: Todo['id']) => boolean;
  onTodoDelete: (todoId: Todo['id']) => void;
  onTodoUpdate: (todoId: Todo['id'], todoData: Partial<Todo>) => Promise<void>;
  editingTodoId: Todo['id'] | null;
  setEditingTodoId: (todoId: Todo['id'] | null) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  isTodoLoading,
  onTodoDelete,
  onTodoUpdate,
  editingTodoId,
  setEditingTodoId,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isTodoLoading={isTodoLoading}
          onTodoDelete={onTodoDelete}
          onTodoUpdate={onTodoUpdate}
          editingTodoId={editingTodoId}
          setEditingTodoId={setEditingTodoId}
        />
      ))}
      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          isTodoLoading={isTodoLoading}
          isTempTodo={true}
        />
      )}
    </section>
  );
};
