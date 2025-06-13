/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { Todo } from '../../types/todo/Todo';
import { TodoItem } from '../TodoItem';

type Props = {
  todos: Todo[];
  tempTodo: Todo | null;
  onTodoDelete: (todoId: Todo['id']) => void;
  todoToDeleteIds: Todo['id'][];
  onTodoUpdate: (todoId: Todo['id'], todoData: Partial<Todo>) => Promise<void>;
  todoToUpdateIds: Todo['id'][];
  editingTodoId: Todo['id'] | null;
  setEditingTodoId: (todoId: Todo['id'] | null) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  onTodoDelete,
  todoToDeleteIds,
  onTodoUpdate,
  todoToUpdateIds,
  editingTodoId,
  setEditingTodoId,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onTodoDelete={onTodoDelete}
          todoToDeleteIds={todoToDeleteIds}
          onTodoUpdate={onTodoUpdate}
          todoToUpdateIds={todoToUpdateIds}
          editingTodoId={editingTodoId}
          setEditingTodoId={setEditingTodoId}
        />
      ))}
      {tempTodo && <TodoItem todo={tempTodo} isTempTodo={true} />}
    </section>
  );
};
