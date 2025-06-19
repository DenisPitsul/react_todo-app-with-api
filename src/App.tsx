/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { TodoList } from './components/TodoList';
import { ErrorComponent } from './components/ErrorComponent';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { useTodoController } from './hooks/useTodoController';

export const App: React.FC = () => {
  const {
    isThereAlLeastOneTodo,
    isTodosLoading,
    errorMessage,
    setErrorMessage,
    tempTodo,
    isTodoLoading,
    isAlLeastOneTodoLoading,
    isAllTodosCompleted,
    onAddTodo,
    isAddTodoFormFocused,
    setIsAddTodoFormFocused,
    onTodoDelete,
    onClearCompletedTodos,
    onTodoUpdate,
    editingTodoId,
    setEditingTodoId,
    isEditTodoFormFocused,
    setIsEditTodoFormFocused,
    onToggleTodos,
    statusFilter,
    setStatusFilter,
    filteredTodos,
    activeTodosCount,
    isThereAtLeastOneCompletedTodo,
  } = useTodoController();

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          isThereAlLeastOneTodo={isThereAlLeastOneTodo}
          setErrorMessage={setErrorMessage}
          onAddTodo={onAddTodo}
          isAddTodoFormFocused={isAddTodoFormFocused}
          setIsAddTodoFormFocused={setIsAddTodoFormFocused}
          isAlLeastOneTodoLoading={isAlLeastOneTodoLoading}
          isAllTodosCompleted={isAllTodosCompleted}
          onToggleTodos={onToggleTodos}
        />

        <TodoList
          todos={filteredTodos}
          tempTodo={tempTodo}
          isTodoLoading={isTodoLoading}
          onTodoDelete={onTodoDelete}
          onTodoUpdate={onTodoUpdate}
          editingTodoId={editingTodoId}
          setEditingTodoId={setEditingTodoId}
          isEditTodoFormFocused={isEditTodoFormFocused}
          setIsEditTodoFormFocused={setIsEditTodoFormFocused}
        />

        {!isTodosLoading && isThereAlLeastOneTodo && (
          <Footer
            activeTodosCount={activeTodosCount}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            isThereAtLeastOneCompletedTodo={isThereAtLeastOneCompletedTodo}
            onClearCompletedTodos={onClearCompletedTodos}
          />
        )}
      </div>

      <ErrorComponent
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
