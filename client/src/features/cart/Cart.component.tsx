import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/persist/persist";
import { LoadingSpinner } from "@/components/common/loading spinner/LoadingSpinner.component";

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const Todo = () => {
  const { username } = useSelector((state: RootState) => state.userdata);
  const [isLoading, setIsLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "completed"
  >("all");

  // Simulate loading data on mount
  useEffect(() => {
    setIsLoading(true);
    // Mock loading todos from an API
    setTimeout(() => {
      const savedTodos = localStorage.getItem(`todos-${username}`);
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
      setIsLoading(false);
    }, 300);
  }, [username]);

  // Save todos to localStorage when updated
  useEffect(() => {
    if (todos.length > 0 || localStorage.getItem(`todos-${username}`)) {
      localStorage.setItem(`todos-${username}`, JSON.stringify(todos));
    }
  }, [todos, username]);

  const handleAddTodo = () => {
    if (!newTodo.title.trim()) return;

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title.trim(),
      description: newTodo.description.trim(),
      completed: false,
    };

    setTodos([...todos, todo]);
    setNewTodo({ title: "", description: "" });
  };

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleEditTodo = (id: string) => {
    // In a real app, this would open an edit modal
    const todoToEdit = todos.find((todo) => todo.id === id);
    if (!todoToEdit) return;

    const newTitle = prompt("Edit title:", todoToEdit.title);
    const newDescription = prompt("Edit description:", todoToEdit.description);

    if (newTitle === null || newDescription === null) return;

    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title: newTitle.trim() || todo.title,
              description: newDescription.trim(),
            }
          : todo
      )
    );
  };

  // Filter todos based on active filter
  const filteredTodos = todos.filter((todo) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return !todo.completed;
    return todo.completed; // "completed" filter
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading your todos..." />;
  }

  return (
    <>
      <Helmet>
        <title>Todo Dashboard | Task Management</title>
        <meta
          name="description"
          content="Manage your tasks and stay organized with our simple todo dashboard."
        />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold mb-6">Todo Dashboard</h1>

        {/* Todo Input Form */}
        <Card className="p-4 mb-6 bg-white shadow-sm">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Todo title"
                value={newTodo.title}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, title: e.target.value })
                }
                className="w-full"
              />
              <Input
                type="text"
                placeholder="Todo description"
                value={newTodo.description}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, description: e.target.value })
                }
                className="w-full"
              />
            </div>
            <Button
              onClick={handleAddTodo}
              className="bg-[#16C47F] hover:bg-[#16C47F]/90 text-white w-full md:w-auto md:self-end"
            >
              Add Todo
            </Button>
          </div>
        </Card>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => setActiveFilter("all")}
            variant={activeFilter === "all" ? "default" : "outline"}
            className={activeFilter === "all" ? "bg-[#16C47F]" : ""}
          >
            All
          </Button>
          <Button
            onClick={() => setActiveFilter("active")}
            variant={activeFilter === "active" ? "default" : "outline"}
            className={activeFilter === "active" ? "bg-[#16C47F]" : ""}
          >
            Active
          </Button>
          <Button
            onClick={() => setActiveFilter("completed")}
            variant={activeFilter === "completed" ? "default" : "outline"}
            className={activeFilter === "completed" ? "bg-[#16C47F]" : ""}
          >
            Completed
          </Button>
        </div>

        {/* Todo List */}
        {filteredTodos.length > 0 ? (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <Card key={todo.id} className="bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      className="h-5 w-5"
                    />
                    <div
                      className={
                        todo.completed ? "line-through text-gray-500" : ""
                      }
                    >
                      <h3 className="font-medium">{todo.title}</h3>
                      {todo.description && (
                        <p className="text-sm text-gray-600">
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditTodo(todo.id)}
                      size="sm"
                      className="bg-[#16C47F] hover:bg-[#16C47F]/90 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteTodo(todo.id)}
                      size="sm"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No todos found. Add some tasks to get started!
          </div>
        )}

        {/* Todo Counter */}
        {todos.length > 0 && (
          <div className="mt-4 text-gray-600 text-sm">
            Showing {filteredTodos.length} of {todos.length} todos
          </div>
        )}
      </div>
    </>
  );
};

export default Todo;
