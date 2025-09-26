import React, { useState } from 'react';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  StarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useSkillsMatrix } from '../../contexts/SkillsMatrixContext';

interface SkillsMatrixProps {
  className?: string;
}

export default function SkillsMatrix({ className = '' }: SkillsMatrixProps) {
  const {
    skills,
    teamMembers,
    skillGaps,
    trainingRecommendations,
    getSkillCoverage,
    getTeamMemberSkillLevel,
    getExpiringCertifications,
    addTeamMemberSkill
  } = useSkillsMatrix();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showSkillGaps, setShowSkillGaps] = useState(false);
  const [showTrainingRecommendations, setShowTrainingRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'gaps' | 'training' | 'expiring'>('matrix');

  const expiringCertifications = getExpiringCertifications(90);
  const criticalGaps = skillGaps.filter(gap => gap.team_coverage < 50);
  const highPriorityTraining = trainingRecommendations.filter(rec => rec.priority === 'high');

  const getSkillLevelColor = (level: number | null) => {
    if (!level) return 'bg-gray-100 text-gray-500';
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 5: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getSkillLevelText = (level: number | null) => {
    if (!level) return '-';
    switch (level) {
      case 1: return 'Basic';
      case 2: return 'Limited';
      case 3: return 'Competent';
      case 4: return 'Proficient';
      case 5: return 'Expert';
      default: return '-';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'certification': return '🎓';
      case 'technical': return '⚙️';
      case 'safety': return '⛑️';
      case 'soft_skills': return '🤝';
      default: return '📋';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'matrix', label: 'Skills Matrix', count: teamMembers.length },
            { key: 'gaps', label: 'Skill Gaps', count: criticalGaps.length },
            { key: 'training', label: 'Training Needs', count: highPriorityTraining.length },
            { key: 'expiring', label: 'Expiring Certs', count: expiringCertifications.length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs ${
                count > 0 && (key === 'gaps' || key === 'training' || key === 'expiring')
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Skills Matrix Tab */}
      {activeTab === 'matrix' && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{skills.length}</div>
              <div className="text-sm text-gray-600">Skills Tracked</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {skills.filter(s => s.renewal_required).length}
              </div>
              <div className="text-sm text-gray-600">Certifications</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{expiringCertifications.length}</div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </Card>
          </div>

          {/* Skills Matrix Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Team Skills Matrix</h3>
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Skill
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Member
                    </th>
                    {skills.map(skill => (
                      <th key={skill.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24">
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">{getCategoryIcon(skill.category)}</span>
                          <span className="text-center leading-tight">{skill.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map(member => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.position}</div>
                          </div>
                        </div>
                      </td>
                      {skills.map(skill => {
                        const level = getTeamMemberSkillLevel(member.id, skill.id);
                        const memberSkill = member.skills.find(s => s.skill_id === skill.id);
                        const isExpiring = memberSkill?.expiry_date && 
                          new Date(memberSkill.expiry_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                        
                        return (
                          <td key={skill.id} className="px-3 py-4 whitespace-nowrap text-center">
                            <div className="relative">
                              <span className={`inline-flex items-center justify-center w-12 h-8 rounded-full text-xs font-medium ${getSkillLevelColor(level)}`}>
                                {level || '-'}
                              </span>
                              {isExpiring && (
                                <div className="absolute -top-1 -right-1">
                                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                                </div>
                              )}
                              {memberSkill?.status === 'expired' && (
                                <div className="absolute -top-1 -right-1">
                                  <XMarkIcon className="h-4 w-4 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {getSkillLevelText(level)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                  <span>Expert (5)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                  <span>Proficient (4)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
                  <span>Competent (3)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-100 rounded-full"></div>
                  <span>Limited (2)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                  <span>Basic (1)</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                <span>Expiring Soon</span>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Skill Gaps Tab */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Critical Skill Gaps</h3>
            {criticalGaps.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No critical skill gaps identified</p>
                <p className="text-sm text-gray-500">All essential skills have adequate team coverage</p>
              </div>
            ) : (
              <div className="space-y-4">
                {criticalGaps.map(gap => {
                  const skill = skills.find(s => s.id === gap.skill_id);
                  
                  return (
                    <Card key={gap.skill_id} className="p-4 border-l-4 border-l-red-500 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            <h4 className="font-medium text-red-900">{gap.skill_name}</h4>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {gap.team_coverage}% coverage
                            </span>
                          </div>
                          <p className="text-sm text-red-700 mb-2">
                            Required level: {gap.required_level} • {gap.training_needed.length} team members need training
                          </p>
                          {gap.expiring_soon > 0 && (
                            <p className="text-sm text-red-600">
                              ⚠️ {gap.expiring_soon} certifications expiring within 90 days
                            </p>
                          )}
                        </div>
                        <Button size="sm">
                          Plan Training
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>

          {/* All Skill Coverage */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Coverage Analysis</h3>
            <div className="space-y-3">
              {skills.map(skill => {
                const coverage = getSkillCoverage(skill.id);
                
                return (
                  <div key={skill.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getCategoryIcon(skill.category)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{skill.name}</p>
                        <p className="text-sm text-gray-600">{skill.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            coverage.percentage >= 75 ? 'bg-green-500' :
                            coverage.percentage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${coverage.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-16">
                        {coverage.covered}/{coverage.total} ({coverage.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Training Recommendations Tab */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Training Recommendations</h3>
            
            {trainingRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <AcademicCapIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No training recommendations</p>
                <p className="text-sm text-gray-500">All team members meet required skill levels</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trainingRecommendations.map((recommendation, index) => (
                  <Card key={index} className={`p-4 border-l-4 ${
                    recommendation.priority === 'high' ? 'border-l-red-500 bg-red-50' :
                    recommendation.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AcademicCapIcon className={`h-5 w-5 ${
                            recommendation.priority === 'high' ? 'text-red-600' :
                            recommendation.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                          <h4 className={`font-medium ${
                            recommendation.priority === 'high' ? 'text-red-900' :
                            recommendation.priority === 'medium' ? 'text-yellow-900' :
                            'text-green-900'
                          }`}>
                            {recommendation.team_member_name}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                            recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {recommendation.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${
                          recommendation.priority === 'high' ? 'text-red-700' :
                          recommendation.priority === 'medium' ? 'text-yellow-700' :
                          'text-green-700'
                        }`}>
                          <strong>Skill:</strong> {recommendation.skill_name}
                        </p>
                        <div className={`text-sm ${
                          recommendation.priority === 'high' ? 'text-red-600' :
                          recommendation.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          <p>Current Level: {recommendation.current_level} → Target: {recommendation.target_level}</p>
                          <p>Duration: {recommendation.estimated_duration}</p>
                          {recommendation.cost_estimate && <p>Estimated Cost: {recommendation.cost_estimate}</p>}
                          {recommendation.training_provider && <p>Provider: {recommendation.training_provider}</p>}
                        </div>
                      </div>
                      <Button size="sm">
                        Schedule Training
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Expiring Certifications Tab */}
      {activeTab === 'expiring' && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Expiring Certifications</h3>
          
          {expiringCertifications.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">No certifications expiring soon</p>
              <p className="text-sm text-gray-500">All certifications are current</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expiringCertifications.map(skill => {
                const member = teamMembers.find(m => m.id === skill.team_member_id);
                const skillInfo = skills.find(s => s.id === skill.skill_id);
                const daysToExpiry = skill.expiry_date ? 
                  Math.ceil((new Date(skill.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                
                return (
                  <Card key={skill.id} className={`p-4 border-l-4 ${
                    daysToExpiry <= 30 ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CalendarDaysIcon className={`h-5 w-5 ${
                            daysToExpiry <= 30 ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                          <h4 className={`font-medium ${
                            daysToExpiry <= 30 ? 'text-red-900' : 'text-yellow-900'
                          }`}>
                            {skillInfo?.name} - {member?.name}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            daysToExpiry <= 7 ? 'bg-red-100 text-red-800' :
                            daysToExpiry <= 30 ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {daysToExpiry} days left
                          </span>
                        </div>
                        <div className={`text-sm ${
                          daysToExpiry <= 30 ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          <p>Certificate: {skill.certificate_number}</p>
                          <p>Expires: {skill.expiry_date ? new Date(skill.expiry_date).toLocaleDateString() : 'N/A'}</p>
                          {skillInfo?.certifying_body && <p>Certifying Body: {skillInfo.certifying_body}</p>}
                        </div>
                      </div>
                      <Button size="sm" className={
                        daysToExpiry <= 30 ? 'bg-red-600 hover:bg-red-700' : ''
                      }>
                        {daysToExpiry <= 7 ? 'Renew Now' : 'Schedule Renewal'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}