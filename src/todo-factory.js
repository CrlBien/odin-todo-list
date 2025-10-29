// Factory module for creating structured data
function createList() {
  const items = [];
  return {
    add(item) {
      items.push(item);
    },
    remove(item) {
      const index = items.indexOf(item);
      if (index > -1) items.splice(index, 1);
    },
    getAll() {
      return [...items];
    },
  };
}

function createTodo(title, description, dueDate, priority, completed = false) {
  return { title, description, dueDate, priority, completed };
}

function createNote(notes) {
  return { notes };
}

function todoFolder(name) {
  const { add, remove, getAll } = createList();
  return {
    name,
    addTodo: add,
    removeTodo: remove,
    getAllTodo: getAll,
  };
}

function projectFolder(projectName) {
  const { add, remove, getAll } = createList();
  return {
    projectName,
    addProject: add,
    removeProject: remove,
    getAllProject: getAll,
  };
}

function notesFolder() {
  const { add, remove, getAll } = createList();
  return {
    addNotes: add,
    removeNotes: remove,
    getAllNotes: getAll,
  };
}

export { createTodo, createNote, todoFolder, notesFolder, projectFolder };
