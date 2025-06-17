import { FormEvent, useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../../enums/errorMessage';

type Props = {
  setErrorMessage: (errorMessage: ErrorMessage) => void;
  onAdd: (todoTitle: string) => Promise<void>;
  isAddTodoFormFocused: boolean;
  setIsAddTodoFormFocused: (isFocused: boolean) => void;
};

export const AddTodoForm: React.FC<Props> = ({
  setErrorMessage,
  onAdd,
  isAddTodoFormFocused,
  setIsAddTodoFormFocused,
}) => {
  const [todoTitle, setTodoTitle] = useState('');
  const [isIsLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isAddTodoFormFocused) {
      inputRef.current?.focus();
      setIsAddTodoFormFocused(false);
    }
  }, [isAddTodoFormFocused, setIsAddTodoFormFocused]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTodoTitle = todoTitle.trim();

    if (trimmedTodoTitle === '') {
      setErrorMessage(ErrorMessage.OnTitleEmpty);

      return;
    }

    setIsLoading(true);
    onAdd(trimmedTodoTitle)
      .then(() => {
        setTodoTitle('');
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        ref={inputRef}
        data-cy="NewTodoField"
        type="text"
        className="todoapp__new-todo"
        placeholder="What needs to be done?"
        value={todoTitle}
        onChange={event => setTodoTitle(event.target.value.trimStart())}
        disabled={isIsLoading}
      />
    </form>
  );
};
