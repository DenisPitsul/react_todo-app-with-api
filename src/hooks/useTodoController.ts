import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [todosToUpdate, setTodosToUpdate] = useState<Todo[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<Todo['id'] | null>(null);
  const [isEditTodoFormFocused, setIsEditTodoFormFocused] = useState(false);
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

  const filteredTodos = useMemo(() => {
    return getFilteredTodos(todos, statusFilter);
  }, [todos, statusFilter]);

  const {
    isThereAlLeastOneTodo,
    isAllTodosCompleted,
    activeItemsCount,
    isThereAtLeastOneCompletedTodo,
  } = useMemo(() => {
    return {
      isThereAlLeastOneTodo: !!todos.length,
      isAllTodosCompleted: todos.every(todo => todo.completed),
      activeItemsCount: todos.filter(todo => !todo.completed).length,
      isThereAtLeastOneCompletedTodo: todos.some(todo => todo.completed),
    };
  }, [todos]);

  const isTodoLoading = useCallback(
    (todoId: number) => {
      return (
        tempTodo?.id === todoId ||
        todoToDeleteIds?.includes(todoId) ||
        todosToUpdate?.findIndex(todoParam => todoParam.id === todoId) !== -1
      );
    },
    [tempTodo, todoToDeleteIds, todosToUpdate],
  );

  const isAlLeastOneTodoLoading = useMemo(() => {
    return todos.some(todo => isTodoLoading(todo.id));
  }, [todos, isTodoLoading]);

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

    return todoService
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
    const foundTodoToUpdate = todos.find(todo => todo.id === todoId) as Todo;

    setTodosToUpdate(current => [...current, foundTodoToUpdate]);

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
        if (isTitleChange) {
          setIsEditTodoFormFocused(true);
        }

        throw error;
      })
      .finally(() => {
        setTodosToUpdate(current => current.filter(todo => todo.id !== todoId));
      });
  };

  const onClearCompletedTodos = () => {
    const allCompletedTodoIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    Promise.all(allCompletedTodoIds.map(id => onTodoDelete(id)));
  };

  const onToggleTodos = () => {
    const newStatus = !isAllTodosCompleted;

    const localTodosToUpdate = todos.filter(
      todo => todo.completed !== newStatus,
    );

    Promise.all(
      localTodosToUpdate.map(todoToUpdate =>
        onTodoUpdate(todoToUpdate.id, { completed: newStatus }),
      ),
    );
  };

  return {
    todos,
    isThereAlLeastOneTodo,
    isTodosLoading,
    isAlLeastOneTodoLoading,
    isAllTodosCompleted,
    errorMessage,
    setErrorMessage,
    tempTodo,
    isTodoLoading,
    onAddTodo,
    isAddTodoFormFocused,
    setIsAddTodoFormFocused,
    onTodoDelete,
    todoToDeleteIds,
    onClearCompletedTodos,
    todosToUpdate,
    onTodoUpdate,
    editingTodoId,
    setEditingTodoId,
    isEditTodoFormFocused,
    setIsEditTodoFormFocused,
    onToggleTodos,
    statusFilter,
    setStatusFilter,
    filteredTodos,
    activeItemsCount,
    isThereAtLeastOneCompletedTodo,
  };
};
