import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Todo } from "@shared/schema";

export default function TodoPanel() {
  const [newTodo, setNewTodo] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["todos", 1],
    queryFn: () => api.todo.getTodosByUserId(1), // Hardcoded user ID
  });

  const addTodoMutation = useMutation({
    mutationFn: (todoData: { userId: number; title: string; dueTime?: string }) =>
      api.todo.createTodo(todoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", 1] });
      setNewTodo("");
      toast({
        title: "Success",
        description: "Todo added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add todo",
        variant: "destructive",
      });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Todo> }) =>
      api.todo.updateTodo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", 1] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: number) => api.todo.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", 1] });
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    },
  });

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    addTodoMutation.mutate({
      userId: 1,
      title: newTodo.trim(),
      dueTime: "No due date",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const toggleTodo = (todo: Todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      updates: { completed: !todo.completed },
    });
  };

  const deleteTodo = (id: number) => {
    deleteTodoMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Today's Tasks</h3>
            <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3 p-3">
                <div className="w-4 h-4 bg-slate-200 rounded mt-1"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Today's Tasks</h3>
          <Button
            size="icon"
            onClick={handleAddTodo}
            disabled={addTodoMutation.isPending}
            className="w-8 h-8 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {todos?.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo)}
                className="mt-1"
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    todo.completed
                      ? "text-slate-500 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {todo.title}
                </p>
                <p
                  className={`text-xs ${
                    todo.completed ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {todo.dueTime}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTodo(todo.id)}
                disabled={deleteTodoMutation.isPending}
                className="text-slate-400 hover:text-red-500 h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleAddTodo}
              disabled={addTodoMutation.isPending || !newTodo.trim()}
              className="text-sm font-medium"
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
