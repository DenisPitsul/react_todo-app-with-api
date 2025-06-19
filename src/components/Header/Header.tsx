import React from 'react';
import cn from 'classnames';
import { AddTodoForm } from '../AddTodoForm';
import { ErrorMessage } from '../../enums/errorMessage';

type Props = {
  errorMessage: ErrorMessage;
  isThereAlLeastOneTodo: boolean;
  onAddTodo: (todoTitle: string) => Promise<void>;
  isAddTodoFormFocused: boolean;
  setIsAddTodoFormFocused: (isFocused: boolean) => void;
  isAlLeastOneTodoLoading: boolean;
  isAllTodosCompleted: boolean;
  onToggleTodos: () => void;
};

export const Header: React.FC<Props> = ({
  errorMessage,
  isThereAlLeastOneTodo,
  onAddTodo,
  isAddTodoFormFocused,
  setIsAddTodoFormFocused,
  isAlLeastOneTodoLoading,
  isAllTodosCompleted,
  onToggleTodos,
}) => {
  return (
    <header className="todoapp__header">
      {isThereAlLeastOneTodo && !isAlLeastOneTodoLoading && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', { active: isAllTodosCompleted })}
          data-cy="ToggleAllButton"
          onClick={onToggleTodos}
        />
      )}

      <AddTodoForm
        errorMessage={errorMessage}
        onAdd={onAddTodo}
        isAddTodoFormFocused={isAddTodoFormFocused}
        setIsAddTodoFormFocused={setIsAddTodoFormFocused}
      />
    </header>
  );
};
