"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Clock, CheckCircle2, Circle, Trash2 } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"

interface Task {
    id: string
    patientId: string
    type: "medication" | "vitals" | "procedure" | "other"
    title: string
    description: string
    time: string
    completed: boolean
    priority: "low" | "medium" | "high"
}

export default function SchedulerPage() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: "1",
            patientId: "P-1234",
            type: "medication",
            title: "Administer insulin",
            description: "10 units subcutaneous",
            time: "09:00",
            completed: false,
            priority: "high",
        },
        {
            id: "2",
            patientId: "P-5678",
            type: "vitals",
            title: "Check blood pressure",
            description: "Monitor for hypertension",
            time: "10:30",
            completed: true,
            priority: "medium",
        },
        {
            id: "3",
            patientId: "P-9012",
            type: "procedure",
            title: "Wound dressing change",
            description: "Post-surgical care",
            time: "14:00",
            completed: false,
            priority: "medium",
        },
    ])

    const [showAddForm, setShowAddForm] = useState(false)
    const [newTask, setNewTask] = useState<Partial<Task>>({
        type: "medication",
        priority: "medium",
    })

    const toggleTaskComplete = (id: string) => {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
    }

    const deleteTask = (id: string) => {
        setTasks(tasks.filter((task) => task.id !== id))
    }

    const addTask = () => {
        if (!newTask.patientId || !newTask.title || !newTask.time) return

        const task: Task = {
            id: Date.now().toString(),
            patientId: newTask.patientId!,
            type: newTask.type as Task["type"],
            title: newTask.title!,
            description: newTask.description || "",
            time: newTask.time!,
            completed: false,
            priority: newTask.priority as Task["priority"],
        }

        setTasks([...tasks, task].sort((a, b) => a.time.localeCompare(b.time)))
        setNewTask({ type: "medication", priority: "medium" })
        setShowAddForm(false)
    }

    const taskTypeColors = {
        medication: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
        vitals: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
        procedure: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
        other: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    }

    const priorityColors = {
        low: "border-l-4 border-l-green-500",
        medium: "border-l-4 border-l-yellow-500",
        high: "border-l-4 border-l-red-500",
    }

    const pendingTasks = tasks.filter((t) => !t.completed)
    const completedTasks = tasks.filter((t) => t.completed)

    return (
        <div className="mx-auto max-w-md min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="min-h-screen bottom-nav-spacing p-4">
                <PageHeader
                    title="Scheduler"
                    subtitle="Track patient care activities"
                    icon={<Calendar className="w-6 h-6" />}
                />

                <div className="grid grid-cols-3 gap-3 mb-6">
                    <Card className="p-3">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{pendingTasks.length}</div>
                            <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{completedTasks.length}</div>
                            <div className="text-xs text-muted-foreground">Completed</div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                                {new Date().getDate()}
                            </div>
                            <div className="text-xs text-muted-foreground">Today</div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Today's Schedule</h2>
                        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="h-8">
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    {showAddForm && (
                        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200">
                            <h3 className="font-semibold mb-3 text-sm">New Task</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="patientId" className="text-xs">Patient ID</Label>
                                        <Input
                                            id="patientId"
                                            placeholder="P-12345"
                                            value={newTask.patientId || ""}
                                            onChange={(e) => setNewTask({ ...newTask, patientId: e.target.value })}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="time" className="text-xs">Time</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={newTask.time || ""}
                                            onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                                            className="h-9"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="type" className="text-xs">Type</Label>
                                        <Select
                                            value={newTask.type}
                                            onValueChange={(value) => setNewTask({ ...newTask, type: value as Task["type"] })}
                                        >
                                            <SelectTrigger id="type" className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="medication">Medication</SelectItem>
                                                <SelectItem value="vitals">Vitals</SelectItem>
                                                <SelectItem value="procedure">Procedure</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="priority" className="text-xs">Priority</Label>
                                        <Select
                                            value={newTask.priority}
                                            onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                                        >
                                            <SelectTrigger id="priority" className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="title" className="text-xs">Task Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Administer medication"
                                        value={newTask.title || ""}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="h-9"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="description" className="text-xs">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Additional details..."
                                        value={newTask.description || ""}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        rows={2}
                                        className="resize-none text-sm"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={addTask} className="flex-1 h-9">
                                        Add Task
                                    </Button>
                                    <Button onClick={() => setShowAddForm(false)} variant="outline" className="h-9">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm text-muted-foreground">PENDING TASKS</h3>
                        {pendingTasks.length === 0 ? (
                            <Card className="p-6 text-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">All tasks completed!</p>
                            </Card>
                        ) : (
                            pendingTasks.map((task) => (
                                <Card key={task.id} className={`p-3 ${priorityColors[task.priority]}`}>
                                    <div className="flex items-start gap-3">
                                        <button onClick={() => toggleTaskComplete(task.id)} className="mt-1">
                                            <Circle className="w-5 h-5 text-muted-foreground hover:text-blue-600" />
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${taskTypeColors[task.type]}`}>
                                                    {task.type}
                                                </span>
                                                <span className="text-xs font-medium text-muted-foreground">{task.time}</span>
                                            </div>
                                            <h4 className="font-semibold mb-1 text-sm">{task.title}</h4>
                                            <p className="text-xs text-muted-foreground mb-1">{task.description}</p>
                                            <p className="text-xs text-muted-foreground">Patient: {task.patientId}</p>
                                        </div>

                                        <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    {completedTasks.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground">COMPLETED TASKS</h3>
                            {completedTasks.map((task) => (
                                <Card key={task.id} className="p-3 opacity-60">
                                    <div className="flex items-start gap-3">
                                        <button onClick={() => toggleTaskComplete(task.id)} className="mt-1">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        </button>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${taskTypeColors[task.type]}`}>
                                                    {task.type}
                                                </span>
                                                <span className="text-xs font-medium text-muted-foreground">{task.time}</span>
                                            </div>
                                            <h4 className="font-semibold mb-1 text-sm line-through">{task.title}</h4>
                                            <p className="text-xs text-muted-foreground mb-1">{task.description}</p>
                                            <p className="text-xs text-muted-foreground">Patient: {task.patientId}</p>
                                        </div>

                                        <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
