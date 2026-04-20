import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { GoalDetail as GoalDetailType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, Calendar, Users, Plus, Trash2 } from 'lucide-react';

const GoalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState<GoalDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [progressData, setProgressData] = useState({ value: '', note: '', date: new Date().toISOString().split('T')[0] });

  const fetchGoal = async () => {
    try {
      const response = await apiClient.get(`/goals/${id}`);
      setGoal(response.data);
    } catch (error) {
      console.error('Error fetching goal', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/goals/${id}/progress`, {
        value: parseFloat(progressData.value),
        note: progressData.note,
        date: progressData.date,
      });
      setShowModal(false);
      setProgressData({ value: '', note: '', date: new Date().toISOString().split('T')[0] });
      fetchGoal();
    } catch (error) {
      console.error('Error adding progress', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja cancelar esta meta?')) {
      try {
        await apiClient.delete(`/goals/${id}`);
        navigate('/');
      } catch (error) {
        console.error('Error deleting goal', error);
      }
    }
  };

  if (loading || !goal) {
    return <div className="flex justify-center items-center h-full">Carregando...</div>;
  }

  const isDupla = goal.type === 'dupla';
  const badgeColor = isDupla ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700';
  const progressColor = isDupla ? 'bg-purple-600' : 'bg-emerald-500';
  const isCreator = goal.created_by === user?.id;

  const myEntries = goal.entries.filter(e => e.user_id === user?.id);
  const partnerEntries = goal.entries.filter(e => e.user_id !== user?.id);
  
  const myTotal = myEntries.reduce((sum, e) => sum + e.value, 0);
  const partnerTotal = partnerEntries.reduce((sum, e) => sum + e.value, 0);

  return (
    <div className="pb-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-4 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={20} className="mr-1" /> Voltar
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{goal.title}</h2>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${badgeColor}`}>
            {isDupla ? 'Dupla' : 'Individual'}
          </span>
        </div>

        {goal.description && (
          <p className="text-gray-600 mb-6">{goal.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
          <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
            <Calendar size={16} className="mr-2 text-indigo-500" />
            <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
          </div>
          {isDupla && goal.partner_name && (
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
              <Users size={16} className="mr-2 text-purple-500" />
              <span>Com: {goal.partner_name}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              Progresso: {goal.current_value} / {goal.target_value} {goal.unit}
            </span>
            <span className="font-bold text-indigo-600 text-lg">{goal.percentage}%</span>
          </div>
          <ProgressBar percentage={goal.percentage} colorClass={progressColor} />
        </div>

        {isDupla && (
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-xs text-indigo-600 font-medium mb-1">Você</p>
              <p className="text-lg font-bold text-indigo-900">{myTotal} {goal.unit}</p>
            </div>
            <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-xs text-purple-600 font-medium mb-1">{goal.partner_name || 'Parceiro'}</p>
              <p className="text-lg font-bold text-purple-900">{partnerTotal} {goal.unit}</p>
            </div>
          </div>
        )}

        {goal.status === 'completed' ? (
          <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl text-center font-bold">
            Meta concluída! 🎉
          </div>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Plus size={20} className="mr-2" /> Registrar Progresso
            </button>
            {isCreator && (
              <button
                onClick={handleDelete}
                className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 transition-colors"
                title="Cancelar Meta"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Histórico</h3>
        {goal.entries.length === 0 ? (
          <p className="text-gray-500 text-center py-6 bg-white rounded-2xl border border-gray-100">
            Nenhum progresso registrado ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {goal.entries.map((entry) => (
              <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="flex items-center mb-1">
                    <span className="font-bold text-gray-800 mr-2">+{entry.value} {goal.unit}</span>
                    {isDupla && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {entry.user_id === user?.id ? 'Você' : entry.user_name}
                      </span>
                    )}
                  </div>
                  {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                </div>
                <div className="text-xs text-gray-400 text-right">
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Registrar Progresso</h3>
            <form onSubmit={handleAddProgress}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor ({goal.unit})</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={progressData.value}
                    onChange={(e) => setProgressData({ ...progressData, value: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={progressData.date}
                    onChange={(e) => setProgressData({ ...progressData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={progressData.note}
                    onChange={(e) => setProgressData({ ...progressData, note: e.target.value })}
                    placeholder="Ex: Treino de pernas"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!progressData.value}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalDetail;
