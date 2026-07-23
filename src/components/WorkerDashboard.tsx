import React, { useState, useEffect } from 'react';
import { Play, Square, CheckCircle, Navigation, Camera, AlertCircle } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function WorkerDashboard({ currentUser }) {
  const [myTasks, setMyTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const { showToast } = useToast();

  const loadTasks = async () => {
    if (!window.api) return;
    const allTasks = await window.api.getTasks();
    const today = new Date().toISOString().split('T')[0];
    
    // Get tasks assigned to me, not completed, and ideally due today or overdue
    const mine = allTasks.filter(t => t.assignedTo === currentUser?.id && t.status !== 'Completed' && t.dueDate <= today);
    setMyTasks(mine);
  };

  useEffect(() => {
    loadTasks();
    const intv = setInterval(loadTasks, 60000);
    return () => clearInterval(intv);
  }, [currentUser]);

  useEffect(() => {
    let interval;
    if (activeTask) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTask]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTask = (task) => {
    if (activeTask) {
      showToast("Please stop your current task first", "warning");
      return;
    }
    setActiveTask(task);
    setTimer(0);
  };

  const handleStopTask = async () => {
    if (!activeTask) return;
    
    const hours = Number((timer / 3600).toFixed(2));
    if (hours > 0.01) {
      await window.api.addTimeEntry({
        projectId: activeTask.projectId,
        userId: currentUser?.id,
        description: `Worked on task: ${activeTask.title}`,
        hours: hours,
        billable: 1,
        status: 'Unbilled',
        date: new Date().toISOString().split('T')[0]
      });
      showToast(`Logged ${hours} hours to project`, "success");
    }
    
    setActiveTask(null);
    setTimer(0);
  };

  const handleMarkComplete = async (task) => {
    await window.api.updateTask({ ...task, status: 'Completed' });
    showToast("Task marked complete!", "success");
    if (activeTask?.id === task.id) {
      await handleStopTask();
    }
    loadTasks();
  };

  return (
    <div style={{ padding: '15px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Today's Actions</h1>
      
      {activeTask && (
        <div style={{ background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>Currently Working On:</h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>{activeTask.title}</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '20px' }}>
            {formatTime(timer)}
          </div>
          <button onClick={handleStopTask} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '15px 30px', fontSize: '1.2rem', borderRadius: '8px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
            <Square size={24} /> Stop Timer
          </button>
        </div>
      )}

      {myTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <CheckCircle size={48} style={{ marginBottom: '15px', color: 'var(--success)', opacity: 0.5 }} />
          <p style={{ fontSize: '1.2rem' }}>You're all caught up for today!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {myTasks.map(task => (
            <div key={task.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: activeTask?.id === task.id ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{task.title}</h3>
                  <span className="badge" style={{ background: task.priority === 'High' ? 'var(--danger)' : 'var(--bg-secondary)', color: task.priority === 'High' ? '#fff' : 'var(--text-primary)' }}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.4' }}>{task.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  onClick={() => handleStartTask(task)} 
                  disabled={activeTask !== null}
                  style={{ background: activeTask ? 'var(--bg-secondary)' : 'var(--success)', color: activeTask ? 'var(--text-secondary)' : 'white', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem' }}
                >
                  <Play size={20} /> {activeTask?.id === task.id ? 'Running' : 'Start'}
                </button>
                <button 
                  onClick={() => handleMarkComplete(task)}
                  style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', border: '2px solid var(--success)', padding: '15px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem' }}
                >
                  <CheckCircle size={20} /> Done
                </button>
              </div>

              {/* Utility actions for mobile */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <button style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                  <Navigation size={16} /> Map
                </button>
                <button style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                  <Camera size={16} /> Photo
                </button>
                <button style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '6px', color: 'var(--warning)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                  <AlertCircle size={16} /> Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
