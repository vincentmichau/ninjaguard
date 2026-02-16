import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Building2, 
  FileText, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Mail,
  TrendingUp,
  Shield
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Admin = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [sites, setSites] = useState([])
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [emailRecipients, setEmailRecipients] = useState([])

  useEffect(() => {
    if (user.role !== 'admin') return
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      if (activeTab === 'stats') {
        const res = await axios.get('/api/admin/stats')
        setStats(res.data)
      } else if (activeTab === 'sites') {
        const res = await axios.get('/api/admin/sites')
        setSites(res.data)
      } else if (activeTab === 'clients') {
        const res = await axios.get('/api/admin/clients')
        setClients(res.data)
      } else if (activeTab === 'users') {
        const res = await axios.get('/api/users')
        setUsers(res.data)
      } else if (activeTab === 'emails') {
        const res = await axios.get('/api/admin/email-recipients')
        setEmailRecipients(res.data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'stats', label: 'Statistiques', icon: TrendingUp },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'sites', label: 'Sites', icon: Building2 },
    { id: 'clients', label: 'Clients', icon: Settings },
    { id: 'emails', label: 'Emails', icon: Mail }
  ]

  if (loading || !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-primary-600" />
            Administration
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les utilisateurs, sites et paramètres de l'application
          </p>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex space-x-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setLoading(true)
                }}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm">Utilisateurs</p>
                  <p className="text-3xl font-bold mt-1">{stats.users}</p>
                </div>
                <Users className="w-10 h-10 text-primary-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Sites</p>
                  <p className="text-3xl font-bold mt-1">{stats.sites}</p>
                </div>
                <Building2 className="w-10 h-10 text-blue-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Rapports</p>
                  <p className="text-3xl font-bold mt-1">{stats.reports}</p>
                </div>
                <FileText className="w-10 h-10 text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Événements</p>
                  <p className="text-3xl font-bold mt-1">{stats.events}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-200" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Utilisateurs</h2>
              <button className="btn-primary flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rôle</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="p-2 hover:bg-gray-200 rounded">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sites' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sites</h2>
              <button className="btn-primary flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {sites.map((site) => (
                <div key={site.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{site.name}</h3>
                    <p className="text-sm text-gray-600">
                      {site.city} {site.postal_code ? `(${site.postal_code})` : ''}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Clients</h2>
              <button className="btn-primary flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    {client.company_name && (
                      <p className="text-sm text-gray-600">{client.company_name}</p>
                    )}
                    {client.email && (
                      <p className="text-sm text-gray-500">{client.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Destinataires Emails</h2>
              <button className="btn-primary flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {emailRecipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{recipient.name || recipient.email}</h3>
                    <p className="text-sm text-gray-600">{recipient.email}</p>
                    {recipient.site_name && (
                      <p className="text-xs text-gray-500">Site: {recipient.site_name}</p>
                    )}
                  </div>
                  <button className="p-2 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Admin