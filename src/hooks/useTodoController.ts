import { useEffect, useMemo, useState } from 'react';
import { Todo } from '../types/todo/Todo';
import * as todoService from '../api/todos';
import { ErrorMessage } from '../enums/errorMessage';
import { StatusFilter } from '../enums/statusFilter';
import { getFilteredTodos } from '../utils/getFilteredTodos';

export const useTodoController = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isTodosLoading, setIsTodosLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.None,
  );
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isAddTodoFormFocused, setIsAddTodoFormFocused] = useState(false);
  const [todoToDeleteIds, setTodoToDeleteIds] = useState<Todo['id'][]>([]);
  const [todoToUpdateIds, setTodoToUpdateIds] = useState<Todo['id'][]>([]);
  const [editingTodoId, setEditingTodoId] = useState<Todo['id'] | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    StatusFilter.All,
  );

  useEffect(() => {
    setIsTodosLoading(true);
    todoService
      .getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage(ErrorMessage.OnLoad);
      })
      .finally(() => setIsTodosLoading(false));
  }, []);

  const onAddTodo = (todoTitle: string) => {
    const newTodo: Omit<Todo, 'id'> = {
      userId: todoService.USER_ID,
      title: todoTitle,
      completed: false,
    };

    const createTodoPromise: Promise<void> = todoService
      .createTodo(newTodo)
      .then(todoFromServer => {
        setTodos(currentTodos => [...currentTodos, todoFromServer]);
      })
      .catch(error => {
        setErrorMessage(ErrorMessage.OnAdd);
        throw error;
      })
      .finally(() => {
        setTempTodo(null);
        setIsAddTodoFormFocused(true);
      });

    setTempTodo({
      ...newTodo,
      id: 0,
    });

    return createTodoPromise;
  };

  const onTodoDelete = (todoId: Todo['id']) => {
    setTodoToDeleteIds(current => [...current, todoId]);

    todoService
      .deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage(ErrorMessage.OnDelete);
      })
      .finally(() => {
        setTodoToDeleteIds(current => current.filter(id => id !== todoId));
        setIsAddTodoFormFocused(true);
      });
  };

  const onTodoUpdate = (
    todoId: Todo['id'],
    todoDataToUpdate: Partial<Todo>,
    isTitleChange = false,
  ) => {
    if (isTitleChange) {
      setEditingTodoId(todoId);
    }

    setTodoToUpdateIds(current => [...current, todoId]);

    return todoService
      .updateTodo(todoId, todoDataToUpdate)
      .then(updatedTodo => {
        setTodos(currentTodos => {
          return currentTodos.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo,
          );
        });
      })
      .catch(error => {
        setErrorMessage(ErrorMessage.onUpdate);
        throw error;
      })
      .finally(() => {
        setTodoToUpdateIds(current => current.filter(id => id !== todoId));
      });
  };

  const onClearCompletedTodos = () => {
    const allCompletedTodoIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    setTodoToDeleteIds(current => [...current, ...allCompletedTodoIds]);

    Promise.allSettled(
      allCompletedTodoIds.map(id => todoService.deleteTodo(id).then(() => id)),
    )
      .then(results => {
        const successfulDeletedIds = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);

        const isSomeToDeleteIdRejected = results.some(
          result => result.status === 'rejected',
        );

        if (isSomeToDeleteIdRejected) {
          setErrorMessage(ErrorMessage.OnDelete);
        }

        setTodos(currentTodos =>
          currentTodos.filter(todo => !successfulDeletedIds.includes(todo.id)),
        );
      })
      .finally(() => {
        setTodoToDeleteIds([]);
        setIsAddTodoFormFocused(true);
      });
  };

  const filteredTodos = useMemo(() => {
    return getFilteredTodos(todos, statusFilter);
  }, [todos, statusFilter]);

  const activeItemsCount = useMemo(() => {
    return todos.filter(todo => !todo.completed).length;
  }, [todos]);

  const isThereAtLeastOneCompletedTodo = useMemo(() => {
    return todos.some(todo => todo.completed);
  }, [todos]);

  return {
    todos,
    setTodos,
    isTodosLoading,
    errorMessage,
    setErrorMessage,
    tempTodo,
    onAddTodo,
    isAddTodoFormFocused,
    setIsAddTodoFormFocused,
    onTodoDelete,
    todoToDeleteIds,
    onClearCompletedTodos,
    todoToUpdateIds,
    onTodoUpdate,
    editingTodoId,
    setEditingTodoId,
    statusFilter,
    setStatusFilter,
    filteredTodos,
    activeItemsCount,
    isThereAtLeastOneCompletedTodo,
  };
};
