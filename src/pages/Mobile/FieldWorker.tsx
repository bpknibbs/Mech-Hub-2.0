import React, { useEffect, useState } from 'react';
import FieldWorkerInterface from '../../components/Mobile/FieldWorkerInterface';
import { OfflineIndicator } from '../../components/Mobile/OfflineStorage';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function FieldWorker() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      // Replace 'some_tech_id' with the actual authenticated user's ID
      // This is an example, you would get the user ID from AuthContext
      const technicianId = 'some_tech_id'; 

      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('assigned_to', technicianId);

      if (error) {
        console.error('Error fetching tasks:', error.message);
      } else {
        setTasks(data);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen">
      <FieldWorkerInterface 
        technician="James Wilson"
        tasks={tasks}
      />
      <OfflineIndicator className="fixed bottom-4 right-4" />
    </div>
  );
}