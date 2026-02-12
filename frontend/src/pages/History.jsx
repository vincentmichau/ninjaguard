import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { 
  History as HistoryIcon, 
  Search, 
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const History = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      if (statusFilter) params.append('status', statusFilter)

      const res = await axios.get(`/api/reports?${params}`)
      setReports(res.data)
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'historique')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    fetchHistory()
  }

  const handleReset = () => {
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
    setSearchTerm('')
    fetchHistory()
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(new Date(report.shift_date), 'dd MMMM yyyy', { locale: fr }).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDateFrom = !dateFrom || new Date(report.shift_date) >= new Date(dateFrom)
    const matchesDateTo = !dateTo || new Date(report.shift_date) <= new Date(dateTo)
    
    return matchesSearch && matchesDateFrom && matchesDateTo
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Historique</h1>
          <p className="text-gray-600 mt-1">Consultez tous vos rapports passés</p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="w-40">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="w-40">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Tous</option>
                <option value="draft">Brouillons</option>
                <option value="validated">Validés</option>
              </select>
            </div>

            <button onClick={handleFilter} className="btn-primary">
              <Filter className="w-5 h-5 mr-2" />
              Filtrer
            </button>

            <button onClick={handleReset} className="btn-secondary">
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredReports.length} rapport{filteredReports.length !== 1 ? 's' : ''} trouvé{filteredReports.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredReports.length === 0 ? (
          <div className="card text-center py-12">
            <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun rapport trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="bg-primary-100 p-4 rounded-lg mr-4">
                      <Calendar className="w-6 h-6 text-primary-600" />
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
                        {format(new Date(report.shift_date), 'EEEE d MMMM yyyy', { locale: fr })}
                        {' • '}
                        {format(new Date(report.shift_start), 'HH:mm')}
                        {' - '}
                        {format(new Date(report.shift_end), 'HH:mm')}
                      </p>
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
                    
                    {report.status === 'validated' && (
                      <button
                        onClick={() => window.open(`/api/reports/${report.id}/pdf`, '_blank')}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Télécharger PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default History