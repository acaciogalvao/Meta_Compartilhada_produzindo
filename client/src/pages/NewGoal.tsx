import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { User } from '../types';
import { User as UserIcon, Users, Search, CheckCircle2 } from 'lucide-react';

const NewGoal: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'individual' | 'dupla'>('individual');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_value: '',
    unit: '',
    deadline: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (type === 'dupla') setStep(3);
      else setStep(4);
    } else if (step === 3) setStep(4);
  };

  const handleBack = () => {
    if (step === 4) {
      if (type === 'dupla') setStep(3);
      else setStep(2);
    } else if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const res = await apiClient.get(`/users/search?q=${query}`);
        setSearchResults(res.data);
      } catch (error) {
        console.error('Error searching users', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiClient.post('/goals', {
        ...formData,
        type,
        target_value: parseFloat(formData.target_value),
        partner_id: selectedPartner?.id,
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating goal', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nova Meta</h2>
        <p className="text-gray-500 text-sm">Passo {step} de {type === 'dupla' ? 4 : 3}</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Escolha o tipo de meta</h3>
          
          <button
            onClick={() => { setType('individual'); handleNext(); }}
            className="w-full bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-200 shadow-sm"
          >
            <div className="bg-emerald-100 p-4 rounded-full mb-4">
              <UserIcon size={32} className="text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Individual</h4>
            <p className="text-gray-500 text-center text-sm">Uma meta só para você alcançar.</p>
          </button>

          <button
            onClick={() => { setType('dupla'); handleNext(); }}
            className="w-full bg-white border-2 border-purple-100 hover:border-purple-500 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-200 shadow-sm"
          >
            <div className="bg-purple-100 p-4 rounded-full mb-4">
              <Users size={32} className="text-purple-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Em Dupla</h4>
            <p className="text-gray-500 text-center text-sm">Convide alguém para alcançar junto com você.</p>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Detalhes da Meta</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Ler 10 livros"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes adicionais (opcional)"
                rows={3}
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor alvo</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  placeholder="Ex: 10"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Ex: livros, km, kg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-8">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleNext}
              disabled={!formData.title || !formData.target_value || !formData.unit || !formData.deadline}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {step === 3 && type === 'dupla' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Escolher Parceiro</h3>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedPartner(user)}
                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                  selectedPartner?.id === user.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                {selectedPartner?.id === user.id && (
                  <CheckCircle2 size={20} className="text-indigo-600" />
                )}
              </div>
            ))}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-center text-gray-500 py-4">Nenhum usuário encontrado.</p>
            )}
          </div>

          <div className="flex space-x-3 mt-8">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedPartner}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-6">Revisar e Confirmar</h3>
          
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-sm text-gray-500">Tipo</p>
              <p className="font-medium text-gray-800 capitalize">{type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Título</p>
              <p className="font-medium text-gray-800">{formData.title}</p>
            </div>
            {formData.description && (
              <div>
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="font-medium text-gray-800">{formData.description}</p>
              </div>
            )}
            <div className="flex space-x-8">
              <div>
                <p className="text-sm text-gray-500">Alvo</p>
                <p className="font-medium text-gray-800">{formData.target_value} {formData.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prazo</p>
                <p className="font-medium text-gray-800">{new Date(formData.deadline).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            {type === 'dupla' && selectedPartner && (
              <div>
                <p className="text-sm text-gray-500">Parceiro</p>
                <p className="font-medium text-gray-800">{selectedPartner.name}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewGoal;
