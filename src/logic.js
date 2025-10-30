import { Todo, Note, Project } from "./todo-factory.js";
import Storage from "./storage.js";

const TodoManager = (() => {
  let todos = Storage.loadTodos();

  const add = (title, description, dueDate, priority) => {
    const t = new Todo(title, description, dueDate, priority);
    todos.push(t);
    Storage.saveTodos(todos);
    return t;
  };

  const removeById = (id) => {
    todos = todos.filter((t) => t.id !== id);
    Storage.saveTodos(todos);
  };

  const toggleComplete = (id) => {
    const t = todos.find((x) => x.id === id);
    if (t) {
      t.toggleComplete();
      Storage.saveTodos(todos);
    }
  };

  const edit = (id, changes) => {
    const t = todos.find((x) => x.id === id);
    if (t) {
      t.update(changes);
      Storage.saveTodos(todos);
    }
  };

  const getAll = () => todos;

  return { add, removeById, toggleComplete, edit, getAll, _raw: () => todos };
})();

const NoteManager = (() => {
  let notes = Storage.loadNotes();

  const add = (text) => {
    const n = new Note(text);
    notes.push(n);
    Storage.saveNotes(notes);
    return n;
  };

  const removeById = (id) => {
    notes = notes.filter((n) => n.id !== id);
    Storage.saveNotes(notes);
  };

  const getAll = () => notes;

  return { add, removeById, getAll };
})();

const ProjectManager = (() => {
  let projects = Storage.loadProjects();

  const addProject = (name) => {
    const p = new Project(name);
    projects.push(p);
    Storage.saveProjects(projects);
    return p;
  };

  const removeProjectById = (id) => {
    projects = projects.filter((p) => p.id !== id);
    Storage.saveProjects(projects);
  };

  const addTodoToProject = (projectId, todo) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    proj.addTodo(todo);
    Storage.saveProjects(projects);
  };

  const removeTodoFromProject = (projectId, todoId) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    proj.removeTodoById(todoId);
    Storage.saveProjects(projects);
  };

  const editTodoInProject = (projectId, todoId, changes) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const t = proj.todos.find((x) => x.id === todoId);
    if (t) {
      t.update(changes);
      Storage.saveProjects(projects);
    }
  };

  const toggleCompleteInProject = (projectId, todoId) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const t = proj.todos.find((x) => x.id === todoId);
    if (t) {
      t.toggleComplete();
      Storage.saveProjects(projects);
    }
  };

  const getAll = () => projects;

  return {
    addProject,
    removeProjectById,
    addTodoToProject,
    removeTodoFromProject,
    editTodoInProject,
    toggleCompleteInProject,
    getAll,
  };
})();

function getAllTodosAcross() {
  const roots = TodoManager.getAll();
  const projectTodos = ProjectManager.getAll().flatMap((p) => p.todos);
  return [...roots, ...projectTodos];
}

export { TodoManager, NoteManager, ProjectManager, getAllTodosAcross };
