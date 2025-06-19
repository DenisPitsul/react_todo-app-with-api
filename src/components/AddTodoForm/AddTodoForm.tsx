import { FormEvent, useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../../enums/errorMessage';

type Props = {
  errorMessage: ErrorMessage;
  onAdd: (todoTitle: string) => Promise<void>;
  isAddTodoFormFocused: boolean;
  setIsAddTodoFormFocused: (isFocused: boolean) => void;
};

export const AddTodoForm: React.FC<Props> = ({
  errorMessage,
  onAdd,
  isAddTodoFormFocused,
  setIsAddTodoFormFocused,
}) => {
  const [todoTitle, setTodoTitle] = useState('');
  const [isIsLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddTodoFormFocused || errorMessage === ErrorMessage.OnTitleEmpty) {
      inputRef.current?.focus();
      setIsAddTodoFormFocused(false);
    }
  }, [errorMessage, isAddTodoFormFocused, setIsAddTodoFormFocused]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    onAdd(todoTitle.trim())
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
        autoFocus
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
