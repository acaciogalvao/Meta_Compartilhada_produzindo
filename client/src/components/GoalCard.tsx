import React from 'react';
import { Link } from 'react-router-dom';
import { Goal } from '../types';
import ProgressBar from './ProgressBar';
import { Calendar, Users, User } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const isDupla = goal.type === 'dupla';
  const badgeColor = isDupla ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700';
  const progressColor = isDupla ? 'bg-purple-600' : 'bg-emerald-500';

  return (
    <Link to={`/goal/${goal.id}`} className="block mb-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{goal.title}</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColor}`}>
            {isDupla ? 'Dupla' : 'Individual'}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
          </div>
          {isDupla && goal.partner_name && (
            <div className="flex items-center">
              <Users size={14} className="mr-1" />
              <span className="line-clamp-1">{goal.partner_name}</span>
            </div>
          )}
          {!isDupla && (
            <div className="flex items-center">
              <User size={14} className="mr-1" />
              <span>Você</span>
            </div>
          )}
        </div>

        <div className="mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">
              {goal.current_value} / {goal.target_value} {goal.unit}
            </span>
            <span className="font-bold text-indigo-600">{goal.percentage}%</span>
          </div>
          <ProgressBar percentage={goal.percentage} colorClass={progressColor} />
        </div>
      </div>
    </Link>
  );
};

export default GoalCard;
