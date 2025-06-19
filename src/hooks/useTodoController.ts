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
    activeTodosCount,
    isThereAtLeastOneCompletedTodo,
  } = useMemo(() => {
    return {
      isThereAlLeastOneTodo: !!todos.length,
      isAllTodosCompleted: todos.every(todo => todo.completed),
      activeTodosCount: todos.filter(todo => !todo.completed).length,
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

  const onAddTodo = useCallback((todoTitle: string) => {
    if (todoTitle === '') {
      setErrorMessage(ErrorMessage.OnTitleEmpty);
      setIsAddTodoFormFocused(true);

      return Promise.reject();
    }

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
      .catch(() => {
        setErrorMessage(ErrorMessage.OnAdd);

        throw new Error(ErrorMessage.OnAdd);
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
  }, []);

  const onTodoDelete = useCallback(
    (todoId: Todo['id'], isDeleteAfterUpdate = false) => {
      setTodoToDeleteIds(current => [...current, todoId]);

      return todoService
        .deleteTodo(todoId)
        .then(() => {
          setTodos(currentTodos =>
            currentTodos.filter(todo => todo.id !== todoId),
          );
          setIsAddTodoFormFocused(true);
        })
        .catch(() => {
          setErrorMessage(ErrorMessage.OnDelete);

          if (isDeleteAfterUpdate) {
            setIsEditTodoFormFocused(true);
            throw new Error(ErrorMessage.OnDelete);
          } else {
            setIsAddTodoFormFocused(true);
          }
        })
        .finally(() => {
          setTodoToDeleteIds(current => current.filter(id => id !== todoId));
        });
    },
    [],
  );

  const onTodoUpdate = useCallback(
    (
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
          setEditingTodoId(null);
        })
        .catch(() => {
          setErrorMessage(ErrorMessage.onUpdate);
          if (isTitleChange) {
            setIsEditTodoFormFocused(true);
          }

          throw new Error(ErrorMessage.onUpdate);
        })
        .finally(() => {
          setTodosToUpdate(current =>
            current.filter(todo => todo.id !== todoId),
          );
        });
    },
    [todos],
  );

  const onClearCompletedTodos = useCallback(async () => {
    const allCompletedTodoIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    setTodoToDeleteIds(cur => [...cur, ...allCompletedTodoIds]);

    const results = await Promise.allSettled(
      allCompletedTodoIds.map(id => todoService.deleteTodo(id)),
    );

    const hasOnDeleteError = results.some(
      result => result.status === 'rejected',
    );

    const successfulDeletedIds = allCompletedTodoIds.filter(
      (_, index) => results[index].status === 'fulfilled',
    );

    if (hasOnDeleteError) {
      setErrorMessage(ErrorMessage.OnDelete);
    }

    setTodoToDeleteIds(current =>
      current.filter(id => !allCompletedTodoIds.includes(id)),
    );

    setTodos(current =>
      current.filter(todo => !successfulDeletedIds.includes(todo.id)),
    );

    setIsAddTodoFormFocused(true);
  }, [todos]);

  const onToggleTodos = useCallback(async () => {
    const newStatus = !isAllTodosCompleted;

    const localTodosToUpdate = todos.filter(
      todo => todo.completed !== newStatus,
    );

    setTodosToUpdate(current => [...current, ...localTodosToUpdate]);

    const results = await Promise.allSettled(
      localTodosToUpdate.map(todoToUpdate =>
        todoService.updateTodo(todoToUpdate.id, { completed: newStatus }),
      ),
    );

    const hasOnUpdateError = results.some(
      result => result.status === 'rejected',
    );

    const successfulUpdatedTodos = results
      .filter(result => result.status === 'fulfilled')
      .map(item => item.value);

    if (hasOnUpdateError) {
      setErrorMessage(ErrorMessage.onUpdate);
    }

    setTodosToUpdate(current =>
      current.filter(todo => !localTodosToUpdate.includes(todo)),
    );

    setTodos(current =>
      current.map(todo => {
        const foundSuccessfulUpdatedTodo = successfulUpdatedTodos.find(
          successfulUpdatedTodo => successfulUpdatedTodo.id === todo.id,
        );

        return foundSuccessfulUpdatedTodo ? foundSuccessfulUpdatedTodo : todo;
      }),
    );
  }, [isAllTodosCompleted, todos]);

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
    activeTodosCount,
    isThereAtLeastOneCompletedTodo,
  };
};
