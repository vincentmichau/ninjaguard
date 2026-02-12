import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Moon
} from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [todayShift, setTodayShift] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Récupérer les rapports récents
      const reportsRes = await axios.get('/api/reports?limit=5')
      setRecentReports(reportsRes.data.slice(0, 5))

      // Récupérer le planning du jour
      const today = new Date().toISOString().split('T')[0]
      const planningRes = await axios.get(`/api/planning/personal?date=${today}`)
      setTodayShift(planningRes.data.find(s => s.shift_date === today))

      // Si admin, récupérer les stats
      if (user.role === 'admin') {
        const statsRes = await axios.get('/api/admin/stats')
        setStats(statsRes.data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.first_name} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Voici votre tableau de bord du {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Grid */}
        {user.role === 'admin' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm">Total Rapports</p>
                  <p className="text-3xl font-bold mt-1">{stats.reports}</p>
                </div>
                <FileText className="w-10 h-10 text-primary-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Validés</p>
                  <p className="text-3xl font-bold mt-1">{stats.reports_validated}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Événements</p>
                  <p className="text-3xl font-bold mt-1">{stats.events}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-200" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Utilisateurs</p>
                  <p className="text-3xl font-bold mt-1">{stats.users}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-200" />
              </div>
            </div>
          </div>
        )}

        {/* Today's Shift */}
        {todayShift && (
          <div className="card mb-8 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg mr-4">
                  <Moon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quart de nuit aujourd'hui
                  </h3>
                  <p className="text-gray-600">
                    {todayShift.site_name} • {new Date(todayShift.shift_start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(todayShift.shift_end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <a
                href={`/reports/new?site_id=${todayShift.site_id}`}
                className="btn-primary"
              >
                Créer un rapport
              </a>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a href="/reports/new" className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center">
              <div className="bg-primary-100 p-4 rounded-lg mr-4 group-hover:bg-primary-200 transition-colors">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nouveau Rapport</h3>
                <p className="text-sm text-gray-600">Créer un rapport de veille</p>
              </div>
            </div>
          </a>

          <a href="/planning" className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mon Planning</h3>
                <p className="text-sm text-gray-600">Voir mes quarts à venir</p>
              </div>
            </div>
          </a>

          <a href="/history" className="card hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center">
              <div className="bg-green-100 p-4 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Historique</h3>
                <p className="text-sm text-gray-600">Consulter les rapports passés</p>
              </div>
            </div>
          </a>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Rapports récents</h2>
            <a href="/reports" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Voir tout →
            </a>
          </div>

          {recentReports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun rapport pour le moment</p>
              <a href="/reports/new" className="text-primary-600 hover:underline mt-2 inline-block">
                Créer votre premier rapport
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <a
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-4 ${
                      report.status === 'validated' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{report.site_name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(report.shift_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    report.status === 'validated' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status === 'validated' ? 'Validé' : 'Brouillon'}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard