import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';
import { LogOut, User as UserIcon, Target, CheckCircle, Activity } from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  stats: {
    total_goals: number;
    completed_goals: number;
    active_goals: number;
  };
}

const Profile: React.FC = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile', err);
        setError('Não foi possível carregar o perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full p-6 text-gray-500">Carregando...</div>;
  }

  if (error || !profile) {
    return (
      <div className="text-center p-6 pb-6">
        <p className="text-red-600 mb-4">{error || 'Erro ao carregar perfil'}</p>
        <button
          onClick={logout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm"
        >
          <LogOut size={20} className="mr-2" /> Sair
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="mb-8 text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-md">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <UserIcon size={48} className="text-indigo-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
        <p className="text-gray-500">{profile.email}</p>
        <p className="text-xs text-gray-400 mt-2">
          Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Estatísticas</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center flex flex-col items-center justify-center">
            <Target size={24} className="text-indigo-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{profile.stats.total_goals || 0}</p>
            <p className="text-xs text-gray-500 font-medium">Total</p>
          </div>
          
          <div className="bg-emerald-50 rounded-xl p-4 text-center flex flex-col items-center justify-center">
            <CheckCircle size={24} className="text-emerald-500 mb-2" />
            <p className="text-2xl font-bold text-emerald-700">{profile.stats.completed_goals || 0}</p>
            <p className="text-xs text-emerald-600 font-medium">Concluídas</p>
          </div>
          
          <div className="bg-amber-50 rounded-xl p-4 text-center flex flex-col items-center justify-center">
            <Activity size={24} className="text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-amber-700">{profile.stats.active_goals || 0}</p>
            <p className="text-xs text-amber-600 font-medium">Ativas</p>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm"
      >
        <LogOut size={20} className="mr-2" /> Sair
      </button>
    </div>
  );
};

export default Profile;
