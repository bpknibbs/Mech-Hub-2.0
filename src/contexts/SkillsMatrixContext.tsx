import React, { createContext, useContext, useState } from 'react';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'certification' | 'safety' | 'soft_skills';
  description: string;
  required_level: 1 | 2 | 3 | 4 | 5; // 1=Basic, 5=Expert
  renewal_required: boolean;
  renewal_frequency?: 'annual' | 'bi-annual' | 'tri-annual' | 'none';
  certifying_body?: string;
}

interface TeamMemberSkill {
  id: string;
  team_member_id: string;
  skill_id: string;
  current_level: 1 | 2 | 3 | 4 | 5;
  certified_date?: string;
  expiry_date?: string;
  certificate_number?: string;
  verified_by: string;
  verified_at: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'in_training';
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  hire_date: string;
  skills: TeamMemberSkill[];
  availability: 'available' | 'assigned' | 'unavailable' | 'training';
  current_task?: string;
}

interface SkillGap {
  skill_id: string;
  skill_name: string;
  required_level: number;
  team_coverage: number; // percentage of team with this skill
  expiring_soon: number; // count of expiring certifications
  training_needed: string[]; // team member IDs
}

interface TrainingRecommendation {
  team_member_id: string;
  team_member_name: string;
  skill_id: string;
  skill_name: string;
  current_level: number;
  target_level: number;
  priority: 'high' | 'medium' | 'low';
  estimated_duration: string;
  training_provider?: string;
  cost_estimate?: string;
}

interface SkillsMatrixContextType {
  skills: Skill[];
  teamMembers: TeamMember[];
  skillGaps: SkillGap[];
  trainingRecommendations: TrainingRecommendation[];
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addTeamMemberSkill: (teamMemberId: string, skillId: string, level: number, certificationData?: Partial<TeamMemberSkill>) => void;
  updateTeamMemberSkill: (teamMemberId: string, skillId: string, updates: Partial<TeamMemberSkill>) => void;
  removeTeamMemberSkill: (teamMemberId: string, skillId: string) => void;
  getTeamMembersBySkill: (skillId: string, minimumLevel?: number) => TeamMember[];
  getExpiringCertifications: (daysAhead?: number) => TeamMemberSkill[];
  generateSkillGapAnalysis: () => void;
  generateTrainingRecommendations: () => void;
  getSkillCoverage: (skillId: string) => { covered: number; total: number; percentage: number };
  getTeamMemberSkillLevel: (teamMemberId: string, skillId: string) => number | null;
}

const SkillsMatrixContext = createContext<SkillsMatrixContextType | undefined>(undefined);

export function SkillsMatrixProvider({ children }: { children: React.ReactNode }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [trainingRecommendations, setTrainingRecommendations] = useState<TrainingRecommendation[]>([]);

  React.useEffect(() => {
    loadSkillsData();
  }, []);

  const loadSkillsData = () => {
    // Mock skills data
    const mockSkills: Skill[] = [
      {
        id: 'skill-1',
        name: 'Gas Safe Certification',
        category: 'certification',
        description: 'Legal requirement for working on gas appliances',
        required_level: 3,
        renewal_required: true,
        renewal_frequency: 'annual',
        certifying_body: 'Gas Safe Register'
      },
      {
        id: 'skill-2',
        name: 'Boiler Maintenance',
        category: 'technical',
        description: 'Servicing and repair of heating boilers',
        required_level: 4,
        renewal_required: false
      },
      {
        id: 'skill-3',
        name: 'Water System Hygiene',
        category: 'certification',
        description: 'Legionella prevention and water treatment',
        required_level: 3,
        renewal_required: true,
        renewal_frequency: 'tri-annual',
        certifying_body: 'City & Guilds'
      },
      {
        id: 'skill-4',
        name: 'Electrical Installation',
        category: 'certification',
        description: '18th Edition electrical installation',
        required_level: 3,
        renewal_required: true,
        renewal_frequency: 'tri-annual',
        certifying_body: 'IET'
      },
      {
        id: 'skill-5',
        name: 'BMS Systems',
        category: 'technical',
        description: 'Building management systems operation',
        required_level: 3,
        renewal_required: false
      },
      {
        id: 'skill-6',
        name: 'Emergency Response',
        category: 'safety',
        description: 'Emergency procedures and first aid',
        required_level: 3,
        renewal_required: true,
        renewal_frequency: 'annual',
        certifying_body: 'Red Cross'
      }
    ];

    const mockTeamMembers: TeamMember[] = [
      {
        id: 'james-wilson',
        name: 'James Wilson',
        position: 'Senior Heating Engineer',
        department: 'Mechanical Services',
        email: 'james.wilson@company.com',
        hire_date: '2018-03-15',
        availability: 'assigned',
        current_task: 'Boiler Service - Block A',
        skills: [
          {
            id: 'tms-1',
            team_member_id: 'james-wilson',
            skill_id: 'skill-1',
            current_level: 5,
            certified_date: '2024-01-15',
            expiry_date: '2025-01-15',
            certificate_number: 'GS-2024-001',
            verified_by: 'supervisor-1',
            verified_at: '2024-01-16T10:00:00Z',
            status: 'active'
          },
          {
            id: 'tms-2',
            team_member_id: 'james-wilson',
            skill_id: 'skill-2',
            current_level: 5,
            verified_by: 'supervisor-1',
            verified_at: '2024-01-16T10:00:00Z',
            status: 'active'
          }
        ]
      },
      {
        id: 'sarah-mitchell',
        name: 'Sarah Mitchell',
        position: 'Water Systems Specialist',
        department: 'Plumbing & Water',
        email: 'sarah.mitchell@company.com',
        hire_date: '2019-06-01',
        availability: 'available',
        skills: [
          {
            id: 'tms-3',
            team_member_id: 'sarah-mitchell',
            skill_id: 'skill-3',
            current_level: 4,
            certified_date: '2023-03-10',
            expiry_date: '2026-03-10',
            certificate_number: 'WH-2023-045',
            verified_by: 'supervisor-1',
            verified_at: '2023-03-11T14:00:00Z',
            status: 'active'
          }
        ]
      },
      {
        id: 'michael-chen',
        name: 'Michael Chen',
        position: 'Electrical Technician',
        department: 'Electrical Services',
        email: 'michael.chen@company.com',
        hire_date: '2020-09-15',
        availability: 'unavailable',
        skills: [
          {
            id: 'tms-4',
            team_member_id: 'michael-chen',
            skill_id: 'skill-4',
            current_level: 4,
            certified_date: '2023-09-01',
            expiry_date: '2026-09-01',
            certificate_number: '18ED-2023-089',
            verified_by: 'supervisor-1',
            verified_at: '2023-09-02T09:00:00Z',
            status: 'active'
          },
          {
            id: 'tms-5',
            team_member_id: 'michael-chen',
            skill_id: 'skill-5',
            current_level: 4,
            verified_by: 'supervisor-1',
            verified_at: '2023-09-02T09:00:00Z',
            status: 'active'
          }
        ]
      }
    ];

    setSkills(mockSkills);
    setTeamMembers(mockTeamMembers);
    
    // Generate initial analysis
    setTimeout(() => {
      generateSkillGapAnalysis();
      generateTrainingRecommendations();
    }, 100);
  };

  const addSkill = (skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString()
    };
    setSkills(prev => [...prev, newSkill]);
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setSkills(prev => prev.map(skill => 
      skill.id === id ? { ...skill, ...updates } : skill
    ));
  };

  const deleteSkill = (id: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
    // Also remove from team members
    setTeamMembers(prev => prev.map(member => ({
      ...member,
      skills: member.skills.filter(skill => skill.skill_id !== id)
    })));
  };

  const addTeamMemberSkill = (
    teamMemberId: string, 
    skillId: string, 
    level: number, 
    certificationData?: Partial<TeamMemberSkill>
  ) => {
    const newSkill: TeamMemberSkill = {
      id: Date.now().toString(),
      team_member_id: teamMemberId,
      skill_id: skillId,
      current_level: level as 1 | 2 | 3 | 4 | 5,
      verified_by: 'supervisor-1',
      verified_at: new Date().toISOString(),
      status: 'active',
      ...certificationData
    };

    setTeamMembers(prev => prev.map(member => 
      member.id === teamMemberId ? {
        ...member,
        skills: [...member.skills, newSkill]
      } : member
    ));
  };

  const updateTeamMemberSkill = (teamMemberId: string, skillId: string, updates: Partial<TeamMemberSkill>) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === teamMemberId ? {
        ...member,
        skills: member.skills.map(skill => 
          skill.skill_id === skillId ? { ...skill, ...updates } : skill
        )
      } : member
    ));
  };

  const removeTeamMemberSkill = (teamMemberId: string, skillId: string) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === teamMemberId ? {
        ...member,
        skills: member.skills.filter(skill => skill.skill_id !== skillId)
      } : member
    ));
  };

  const getTeamMembersBySkill = (skillId: string, minimumLevel: number = 1): TeamMember[] => {
    return teamMembers.filter(member =>
      member.skills.some(skill => 
        skill.skill_id === skillId && 
        skill.current_level >= minimumLevel &&
        skill.status === 'active'
      )
    );
  };

  const getExpiringCertifications = (daysAhead: number = 90): TeamMemberSkill[] => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    const allSkills = teamMembers.flatMap(member => member.skills);
    
    return allSkills.filter(skill => {
      if (!skill.expiry_date) return false;
      const expiryDate = new Date(skill.expiry_date);
      return expiryDate <= targetDate && expiryDate > new Date();
    });
  };

  const generateSkillGapAnalysis = () => {
    const gaps: SkillGap[] = skills.map(skill => {
      const teamMembersWithSkill = getTeamMembersBySkill(skill.id, skill.required_level);
      const coverage = (teamMembersWithSkill.length / teamMembers.length) * 100;
      
      const expiringSkills = teamMembers.flatMap(member => 
        member.skills.filter(ts => 
          ts.skill_id === skill.id && 
          ts.expiry_date && 
          new Date(ts.expiry_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        )
      );

      const membersNeedingTraining = teamMembers.filter(member => {
        const memberSkill = member.skills.find(s => s.skill_id === skill.id);
        return !memberSkill || memberSkill.current_level < skill.required_level;
      });

      return {
        skill_id: skill.id,
        skill_name: skill.name,
        required_level: skill.required_level,
        team_coverage: Math.round(coverage),
        expiring_soon: expiringSkills.length,
        training_needed: membersNeedingTraining.map(m => m.id)
      };
    });

    setSkillGaps(gaps);
  };

  const generateTrainingRecommendations = () => {
    const recommendations: TrainingRecommendation[] = [];

    teamMembers.forEach(member => {
      skills.forEach(skill => {
        const memberSkill = member.skills.find(s => s.skill_id === skill.id);
        
        if (!memberSkill && skill.required_level >= 3) {
          // Member missing critical skill
          recommendations.push({
            team_member_id: member.id,
            team_member_name: member.name,
            skill_id: skill.id,
            skill_name: skill.name,
            current_level: 0,
            target_level: skill.required_level,
            priority: 'high',
            estimated_duration: '2-3 weeks',
            training_provider: skill.certifying_body,
            cost_estimate: '£500-800'
          });
        } else if (memberSkill && memberSkill.current_level < skill.required_level) {
          // Member needs skill upgrade
          recommendations.push({
            team_member_id: member.id,
            team_member_name: member.name,
            skill_id: skill.id,
            skill_name: skill.name,
            current_level: memberSkill.current_level,
            target_level: skill.required_level,
            priority: 'medium',
            estimated_duration: '1-2 weeks',
            cost_estimate: '£200-400'
          });
        } else if (memberSkill && memberSkill.expiry_date) {
          const expiryDate = new Date(memberSkill.expiry_date);
          const daysToExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (daysToExpiry <= 90 && daysToExpiry > 0) {
            // Certification expiring soon
            recommendations.push({
              team_member_id: member.id,
              team_member_name: member.name,
              skill_id: skill.id,
              skill_name: `${skill.name} Renewal`,
              current_level: memberSkill.current_level,
              target_level: memberSkill.current_level,
              priority: daysToExpiry <= 30 ? 'high' : 'medium',
              estimated_duration: '1 week',
              training_provider: skill.certifying_body,
              cost_estimate: '£150-300'
            });
          }
        }
      });
    });

    setTrainingRecommendations(recommendations);
  };

  const getSkillCoverage = (skillId: string): { covered: number; total: number; percentage: number } => {
    const total = teamMembers.length;
    const covered = getTeamMembersBySkill(skillId).length;
    const percentage = total > 0 ? (covered / total) * 100 : 0;
    
    return { covered, total, percentage: Math.round(percentage) };
  };

  const getTeamMemberSkillLevel = (teamMemberId: string, skillId: string): number | null => {
    const member = teamMembers.find(m => m.id === teamMemberId);
    const skill = member?.skills.find(s => s.skill_id === skillId);
    return skill?.current_level || null;
  };

  const value = {
    skills,
    teamMembers,
    skillGaps,
    trainingRecommendations,
    addSkill,
    updateSkill,
    deleteSkill,
    addTeamMemberSkill,
    updateTeamMemberSkill,
    removeTeamMemberSkill,
    getTeamMembersBySkill,
    getExpiringCertifications,
    generateSkillGapAnalysis,
    generateTrainingRecommendations,
    getSkillCoverage,
    getTeamMemberSkillLevel,
  };

  return (
    <SkillsMatrixContext.Provider value={value}>
      {children}
    </SkillsMatrixContext.Provider>
  );
}

export function useSkillsMatrix() {
  const context = useContext(SkillsMatrixContext);
  if (context === undefined) {
    throw new Error('useSkillsMatrix must be used within a SkillsMatrixProvider');
  }
  return context;
}