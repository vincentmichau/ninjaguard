import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Reports = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [statusFilter])

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      
      const res = await axios.get(`/api/reports?${params}`)
      setReports(res.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des rapports')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/reports/${id}`)
      toast.success('Rapport supprimé avec succès')
      fetchReports()
      setShowDeleteModal(null)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleDownloadPDF = async (id) => {
    try {
      window.open(`/api/reports/${id}/pdf`, '_blank')
    } catch (error) {
      toast.error('Erreur lors du téléchargement du PDF')
    }
  }

  const filteredReports = reports.filter(report =>
    report.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(report.shift_date).toLocaleDateString('fr-FR').includes(searchTerm)
  )

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
            <p className="text-gray-600 mt-1">Gérez vos rapports de veille</p>
          </div>
          {user.role !== 'watcher' && (
            <a href="/reports/new" className="btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Nouveau Rapport
            </a>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un rapport..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Tous les statuts</option>
                <option value="draft">Brouillons</option>
                <option value="validated">Validés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'Aucun rapport trouvé' : 'Aucun rapport'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter 
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par créer votre premier rapport'}
            </p>
            {!searchTerm && !statusFilter && user.role !== 'watcher' && (
              <a href="/reports/new" className="btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Créer un rapport
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                      report.status === 'validated' 
                        ? 'bg-green-100' 
                        : 'bg-yellow-100'
                    }`}>
                      {report.status === 'validated' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <FileText className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {report.site_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'validated' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status === 'validated' ? 'Validé' : 'Brouillon'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(report.shift_date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {' • '}
                        {new Date(report.shift_start).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {' - '}
                        {new Date(report.shift_end).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      {report.weather && (
                        <p className="text-xs text-gray-500 mt-1">
                          🌤️ {report.weather} • {report.temperature}°C
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <a
                      href={`/reports/${report.id}`}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    
                    {report.status === 'draft' && user.role !== 'watcher' && (
                      <a
                        href={`/reports/${report.id}/edit`}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </a>
                    )}
                    
                    {report.status === 'validated' && (
                      <button
                        onClick={() => handleDownloadPDF(report.id)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                    
                    {report.status === 'draft' && (user.role === 'admin' || report.watcher_id === user.id) && (
                      <>
                        <button
                          onClick={() => setShowDeleteModal(report.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Supprimer le rapport ?
              </h3>
              <p className="text-gray-600 mb-6">
                Cette action est irréversible. Voulez-vous vraiment supprimer ce rapport ?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="btn-danger flex-1"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Reports