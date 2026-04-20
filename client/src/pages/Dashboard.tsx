import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { Goal } from '../types';
import GoalCard from '../components/GoalCard';
import { Check, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const response = await apiClient.get('/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await apiClient.put(`/goals/${id}/accept`);
      fetchGoals();
    } catch (error) {
      console.error('Error accepting goal', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiClient.put(`/goals/${id}/reject`);
      fetchGoals();
    } catch (error) {
      console.error('Error rejecting goal', error);
    }
  };

  const pendingInvites = goals.filter(
    (g) => g.partner_id === user?.id && g.partner_status === 'pending'
  );
  const activeGoals = goals.filter(
    (g) => g.partner_status !== 'pending' || g.created_by === user?.id
  );

  if (loading) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>;
  }

  return (
    <div className="pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Olá, {user?.name}!</h2>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Convites Pendentes</h3>
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{invite.title}</h4>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                  Dupla
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">{invite.creator_name}</span> convidou você para esta meta.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAccept(invite.id)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium flex items-center justify-center hover:bg-indigo-700 transition-colors"
                >
                  <Check size={18} className="mr-1" /> Aceitar
                </button>
                <button
                  onClick={() => handleReject(invite.id)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-medium flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <X size={18} className="mr-1" /> Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Minhas Metas</h3>
        {activeGoals.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-4">Você ainda não tem metas ativas.</p>
          </div>
        ) : (
          activeGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </div>
    </div>
  );
};

export default Dashboard;
