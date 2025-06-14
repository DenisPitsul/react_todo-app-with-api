import React from 'react';
import { AddTodoForm } from '../AddTodoForm';
import { ErrorMessage } from '../../enums/errorMessage';
import cn from 'classnames';

type Props = {
  isThereAlLeastOneTodo: boolean;
  setErrorMessage: (errorMessage: ErrorMessage) => void;
  onAddTodo: (todoTitle: string) => Promise<void>;
  isAddTodoFormFocused: boolean;
  setIsAddTodoFormFocused: (isFocused: boolean) => void;
  isAlLeastOneTodoLoading: boolean;
  isAllTodosCompleted: boolean;
  onToggleTodos: () => void;
};

export const Header: React.FC<Props> = ({
  isThereAlLeastOneTodo,
  setErrorMessage,
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
        setErrorMessage={setErrorMessage}
        onAdd={onAddTodo}
        isAddTodoFormFocused={isAddTodoFormFocused}
        setIsAddTodoFormFocused={setIsAddTodoFormFocused}
      />
    </header>
  );
};
