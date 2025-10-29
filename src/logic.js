import * as Factory from "./todo-factory.js";
import Storage from "./storage.js";

const todo = (() => {
  const todos = Storage.load("todos") || [];

  const add = (title, description, dueDate, priority) => {
    const newTodo = Factory.createTodo(title, description, dueDate, priority);
    todos.push(newTodo);
    Storage.save("todos", todos);
  };

  const remove = (index) => {
    todos.splice(index, 1);
    Storage.save("todos", todos);
  };

  const toggleComplete = (index) => {
    todos[index].completed = !todos[index].completed;
    Storage.save("todos", todos);
  };

  const edit = (index, updated) => {
    todos[index] = { ...todos[index], ...updated };
    Storage.save("todos", todos);
  };

  const getAll = () => todos;

  return { add, remove, toggleComplete, edit, getAll };
})();

const notes = (() => {
  const noteList = Storage.load("notes") || [];

  const add = (noteText) => {
    const note = Factory.createNote(noteText);
    noteList.push(note);
    Storage.save("notes", noteList);
  };

  const remove = (index) => {
    noteList.splice(index, 1);
    Storage.save("notes", noteList);
  };

  const getAll = () => noteList;

  return { add, remove, getAll };
})();

const projects = (() => {
  const projectList = Storage.load("projects") || [];

  const addProject = (name) => {
    projectList.push({ name, todos: [] });
    Storage.save("projects", projectList);
  };

  const removeProject = (index) => {
    projectList.splice(index, 1);
    Storage.save("projects", projectList);
  };

  const addTodoToProject = (projectIndex, todo) => {
    projectList[projectIndex].todos.push(todo);
    Storage.save("projects", projectList);
  };

  const removeTodoFromProject = (projectIndex, todoIndex) => {
    projectList[projectIndex].todos.splice(todoIndex, 1);
    Storage.save("projects", projectList);
  };

  const getAll = () => projectList;

  return {
    addProject,
    removeProject,
    addTodoToProject,
    removeTodoFromProject,
    getAll,
  };
})();

export { todo, notes, projects };
