import React, { useState, useEffect } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { useToast } from './ui/Toast';

export default function ManagementDashboard({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState(ViewMode.Day);
  const [isChecked, setIsChecked] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    if (!window.api) return;
    const dbProjects = await window.api.getProjects();
    const dbTasks = await window.api.getTasks();

    let ganttTasks = [];
    
    // Convert Projects to Gantt tasks (Project level)
    dbProjects.forEach((proj, idx) => {
      const isDelayed = proj.status === 'Delayed';
      const isCompleted = proj.status === 'Completed';
      
      const startDate = new Date(proj.createdAt || Date.now());
      let endDate = new Date(startDate);
      // Give projects a nominal duration if they don't have tasks
      endDate.setDate(endDate.getDate() + 14);

      // Try to find the actual end date from tasks
      const pTasks = dbTasks.filter(t => t.projectId === proj.id);
      if (pTasks.length > 0) {
        const lastTaskDate = new Date(Math.max(...pTasks.map(t => new Date(t.dueDate).getTime())));
        if (lastTaskDate > endDate) endDate = lastTaskDate;
      }

      ganttTasks.push({
        start: startDate,
        end: endDate,
        name: proj.name,
        id: proj.id,
        type: 'project',
        progress: 100, // For parent project, you might calculate this based on child tasks
        isDisabled: false,
        styles: { progressColor: isCompleted ? '#10b981' : isDelayed ? '#ef4444' : '#6366f1', progressSelectedColor: '#4f46e5' }
      });

      // Convert Tasks to Gantt tasks (Task level)
      pTasks.forEach(t => {
        const tEnd = new Date(t.dueDate);
        const tStart = new Date(tEnd);
        tStart.setDate(tStart.getDate() - 2); // Nominal start 2 days before due

        ganttTasks.push({
          start: tStart,
          end: tEnd,
          name: t.title,
          id: t.id,
          type: 'task',
          project: proj.id, // Links task to project
          progress: t.status === 'Completed' ? 100 : 0,
          isDisabled: false,
          dependencies: [],
          styles: { progressColor: t.status === 'Completed' ? '#10b981' : '#f59e0b', progressSelectedColor: '#d97706' }
        });
      });
    });

    if (ganttTasks.length === 0) {
      // Dummy data just so the chart doesn't crash if empty
      ganttTasks = [{
        start: new Date(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
        name: 'No Projects Yet',
        id: 'dummy',
        type: 'project',
        progress: 0,
        isDisabled: true
      }];
    }

    setTasks(ganttTasks);
  };

  useEffect(() => {
    loadData();
  }, []);

  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task) => {
    // In a real app, you'd update the start/end dates in the DB here
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));
    setTasks(newTasks);
    showToast(`${task.name} rescheduled`, "success");
  };

  const handleProgressChange = async (task) => {
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));
    setTasks(newTasks);
    // If it's a child task, update completion status
    if (task.type === 'task') {
      const status = task.progress >= 100 ? 'Completed' : 'In Progress';
      // Assume window.api.updateTask accepts just what it needs
      const dbTasks = await window.api.getTasks();
      const existing = dbTasks.find(x => x.id === task.id);
      if (existing) {
        await window.api.updateTask({ ...existing, status });
        showToast(`Task marked as ${status}`, "success");
      }
    }
  };

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'var(--bg-card)', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Operations & Timelines</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bird's-eye view of all ongoing projects and tasks</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '5px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}>
            <button className={`btn-sm ${view === ViewMode.Day ? 'btn-primary' : ''}`} onClick={() => setView(ViewMode.Day)} style={{ border: 'none', background: view === ViewMode.Day ? 'var(--primary)' : 'transparent', color: view === ViewMode.Day ? '#fff' : 'var(--text-primary)' }}>Day</button>
            <button className={`btn-sm ${view === ViewMode.Week ? 'btn-primary' : ''}`} onClick={() => setView(ViewMode.Week)} style={{ border: 'none', background: view === ViewMode.Week ? 'var(--primary)' : 'transparent', color: view === ViewMode.Week ? '#fff' : 'var(--text-primary)' }}>Week</button>
            <button className={`btn-sm ${view === ViewMode.Month ? 'btn-primary' : ''}`} onClick={() => setView(ViewMode.Month)} style={{ border: 'none', background: view === ViewMode.Month ? 'var(--primary)' : 'transparent', color: view === ViewMode.Month ? '#fff' : 'var(--text-primary)' }}>Month</button>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
            Show Task List
          </label>
        </div>
      </div>

      <div style={{ flex: 1, background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        {tasks.length > 0 && (
          <Gantt
            tasks={tasks}
            viewMode={view}
            onDateChange={handleTaskChange}
            onProgressChange={handleProgressChange}
            listCellWidth={isChecked ? "155px" : ""}
            columnWidth={columnWidth}
            projectProgressColor="#4f46e5"
            projectProgressSelectedColor="#4338ca"
          />
        )}
      </div>
    </div>
  );
}
