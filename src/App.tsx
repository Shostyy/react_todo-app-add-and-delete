import React, { useEffect, useState, useMemo } from 'react';
import { UserWarning } from './UserWarning';

import { Todo } from './types/Todo';

import { getTodos, deleteTodo } from './api/todos';

import { Header } from './components/ErrorMessage/Header/Header';
import { TodoList } from './components/ErrorMessage/TodoList/TodoList';
import { Footer } from './components/ErrorMessage/Footer/Footer';
import { ErrorMessage } from './components/ErrorMessage/ErrorMessage';
import { TodoListState } from './types/TodoListState';
import { Errors } from './types/Errors';

const USER_ID = 12018;

export const App: React.FC = () => {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<TodoListState>(TodoListState.All);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  useEffect(() => {
    getTodos(USER_ID)
      .then(setTodoList)
      .catch(() => setErrorMessage(Errors.Load));
  }, []);

  const filterTodoList = (todoId: number) => {
    setTodoList(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
  };

  const [activeTodos, completedTodos] = useMemo(() => {
    let active = 0;
    let completed = 0;

    if (todoList) {
      active = todoList.filter(todo => !todo.completed).length;
      completed = todoList.filter(todo => todo.completed).length;
    }

    return [active, completed];
  }, [todoList]);

  const todoListToShow: Todo[] | null = useMemo(() => {
    switch (filter) {
      case TodoListState.Completed:
        return todoList.filter(todo => !todo.completed);

      case TodoListState.Active:
        return todoList.filter(todo => todo.completed);

      default:
        return todoList;
    }
  }, [todoList, filter]);

  const handleTodoAdded = (todo: Todo) => {
    setTodoList(prevTodos => [...prevTodos, todo]);
  };

  const clearCompleted = () => {
    const todoToClear = todoList.filter(todo => todo.completed);

    todoToClear.forEach(item => deleteTodo(item.id));

    setTodoList(prevState => prevState.filter(todo => !todo.completed));
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          activeTodos={activeTodos}
          setErrorMessage={setErrorMessage}
          setTempTodo={setTempTodo}
          userId={USER_ID}
          handleTodoAdded={handleTodoAdded}
        />

        {todoListToShow && (
          <TodoList
            todoList={todoListToShow}
            tempTodo={tempTodo}
            filterTodoList={filterTodoList}
          />
        )}

        {todoList && (
          <Footer
            activeTodos={activeTodos}
            completedTodos={completedTodos}
            filter={filter}
            setFilter={setFilter}
            clearCompleted={clearCompleted}
          />
        )}
      </div>

      <ErrorMessage
        errorMessage={errorMessage}
        clearErrorMessage={() => setErrorMessage('')}
      />
    </div>
  );
};
