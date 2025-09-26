import React from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  CalendarDaysIcon,
  DocumentCheckIcon,
  ClockIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useCompliance } from '../../contexts/ComplianceContext';

interface ComplianceDashboardProps {
  className?: string;
}

export default function ComplianceDashboard({ className = '' }: ComplianceDashboardProps) {
  const { 
    certificates, 
    expiringCertificates, 
    expiredCertificates,
    updateCertificate 
  } = useCompliance();

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'LGSR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Fire Safety':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Water Hygiene':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Insurance':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <ShieldCheckIcon className="h-5 w-5 text-green-600" />;
      case 'expiring':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentCheckIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDaysToExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalCertificates = certificates.length;
  const validCertificates = certificates.filter(c => c.status === 'valid').length;
  const complianceRate = totalCertificates > 0 ? (validCertificates / totalCertificates) * 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-3">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{validCertificates}</div>
              <div className="text-sm text-green-600">Valid Certificates</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-3">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-700">{expiringCertificates.length}</div>
              <div className="text-sm text-yellow-600">Expiring Soon</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-700">{expiredCertificates.length}</div>
              <div className="text-sm text-red-600">Expired</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-3">
              <DocumentCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{Math.round(complianceRate)}%</div>
              <div className="text-sm text-blue-600">Compliance Rate</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Critical Alerts */}
      {(expiringCertificates.length > 0 || expiredCertificates.length > 0) && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-medium text-red-900">Critical Compliance Alerts</h3>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              {expiringCertificates.length + expiredCertificates.length}
            </span>
          </div>
          <div className="space-y-3">
            {expiredCertificates.map((cert) => (
              <div key={cert.id} className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">🚨</span>
                      <p className="font-medium text-red-900">EXPIRED: {cert.name}</p>
                    </div>
                    <p className="text-sm text-red-700 mb-1">{cert.location}</p>
                    <p className="text-sm text-red-600">
                      Expired {formatDistanceToNow(new Date(cert.expiry_date), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-red-500">Certificate: {cert.certificate_number}</p>
                  </div>
                  <Button size="sm" variant="danger">
                    Renew Now
                  </Button>
                </div>
              </div>
            ))}
            
            {expiringCertificates.map((cert) => (
              <div key={cert.id} className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">⚠️</span>
                      <p className="font-medium text-yellow-900">EXPIRING: {cert.name}</p>
                    </div>
                    <p className="text-sm text-yellow-700 mb-1">{cert.location}</p>
                    <p className="text-sm text-yellow-600">
                      Expires in {getDaysToExpiry(cert.expiry_date)} days
                    </p>
                    <p className="text-xs text-yellow-500">Certificate: {cert.certificate_number}</p>
                  </div>
                  <Button size="sm">
                    Schedule Renewal
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Certificates Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Certificate Management</h3>
          <Button size="sm">
            Add Certificate
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => {
            const daysToExpiry = getDaysToExpiry(cert.expiry_date);
            
            return (
              <Card key={cert.id} className={`p-4 border-l-4 ${
                cert.status === 'expired' ? 'border-l-red-500 bg-red-50' :
                cert.status === 'expiring' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-green-500 bg-green-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(cert.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.location}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCertificateTypeColor(cert.type)}`}>
                    {cert.type}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issued:</span>
                    <span className="text-gray-900">{new Date(cert.issue_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className={`${
                      cert.status === 'expired' ? 'text-red-600 font-medium' :
                      cert.status === 'expiring' ? 'text-yellow-600 font-medium' :
                      'text-gray-900'
                    }`}>
                      {new Date(cert.expiry_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Left:</span>
                    <span className={`font-medium ${
                      daysToExpiry < 0 ? 'text-red-600' :
                      daysToExpiry <= 30 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {daysToExpiry < 0 ? 'EXPIRED' : `${daysToExpiry} days`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issued by:</span>
                    <span className="text-gray-900">{cert.issued_by}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <Button size="sm" variant="outline">
                      View Cert
                    </Button>
                    <Button size="sm" className={
                      cert.status === 'expired' ? 'bg-red-600 hover:bg-red-700' :
                      cert.status === 'expiring' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      ''
                    }>
                      {cert.status === 'expired' ? 'Renew' : cert.status === 'expiring' ? 'Schedule' : 'Update'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Compliance Calendar */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Compliance Deadlines</h3>
        <div className="space-y-3">
          {certificates
            .filter(cert => cert.status !== 'expired')
            .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())
            .slice(0, 6)
            .map((cert) => {
              const daysToExpiry = getDaysToExpiry(cert.expiry_date);
              
              return (
                <div key={cert.id} className={`p-3 rounded-lg border ${
                  daysToExpiry <= 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className={`h-5 w-5 ${
                        daysToExpiry <= 30 ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{cert.name}</p>
                        <p className="text-sm text-gray-600">{cert.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        daysToExpiry <= 7 ? 'text-red-600' :
                        daysToExpiry <= 30 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {daysToExpiry} days
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(cert.expiry_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Compliance by Type */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance by Category</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(
            certificates.reduce((acc, cert) => {
              acc[cert.type] = acc[cert.type] || { total: 0, valid: 0, expiring: 0, expired: 0 };
              acc[cert.type].total++;
              acc[cert.type][cert.status]++;
              return acc;
            }, {} as Record<string, any>)
          ).map(([type, stats]) => (
            <div key={type} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{type}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCertificateTypeColor(type)}`}>
                  {stats.total}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valid:</span>
                  <span className="text-green-600 font-medium">{stats.valid || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expiring:</span>
                  <span className="text-yellow-600 font-medium">{stats.expiring || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expired:</span>
                  <span className="text-red-600 font-medium">{stats.expired || 0}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${((stats.valid || 0) / stats.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {Math.round(((stats.valid || 0) / stats.total) * 100)}% compliant
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}