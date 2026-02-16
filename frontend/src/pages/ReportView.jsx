import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Mail,
  MapPin,
  Clock,
  Thermometer,
  Cloud,
  CheckCircle,
  AlertTriangle,
  Camera
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ReportView = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [events, setEvents] = useState([])
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    fetchReport()
  }, [id])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const [reportRes, eventsRes, photosRes] = await Promise.all([
        axios.get(`/api/reports/${id}`),
        axios.get(`/api/events/report/${id}`),
        axios.get(`/api/photos/report/${id}`)
      ])

      setReport(reportRes.data)
      setEvents(eventsRes.data)
      setPhotos(photosRes.data)
    } catch (error) {
      toast.error('Erreur lors du chargement du rapport')
      navigate('/reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    window.open(`/api/reports/${id}/pdf`, '_blank')
  }

  const handleSendEmail = async () => {
    try {
      await axios.post(`/api/admin/reports/${id}/send-email`)
      toast.success('Email envoyé avec succès')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'email')
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'observation':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'round':
        return <MapPin className="w-5 h-5 text-green-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
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

  if (!report) {
    return null
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux rapports
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{report.site_name}</h1>
              <p className="text-gray-600 mt-1">
                {new Date(report.shift_date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {report.status === 'validated' && (
                <>
                  <button
                    onClick={handleDownloadPDF}
                    className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Télécharger PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={handleSendEmail}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Envoyer par email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}
              {report.status === 'draft' && (user.role === 'admin' || report.watcher_id === user.id) && (
                <a
                  href={`/reports/${id}/edit`}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Modifier"
                >
                  <Edit className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            report.status === 'validated' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {report.status === 'validated' ? '✓ Rapport validé' : 'Brouillon'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informations</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Horaires</p>
                    <p className="font-medium text-gray-900">
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
                  </div>
                </div>

                {report.weather && (
                  <div className="flex items-center">
                    <Cloud className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Météo</p>
                      <p className="font-medium text-gray-900">{report.weather}</p>
                    </div>
                  </div>
                )}

                {report.temperature && (
                  <div className="flex items-center">
                    <Thermometer className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Température</p>
                      <p className="font-medium text-gray-900">{report.temperature}°C</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Veilleur</p>
                  <p className="font-medium text-gray-900">
                    {report.watcher_first_name} {report.watcher_last_name}
                  </p>
                </div>
              </div>

              {report.general_notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes générales</h3>
                  <p className="text-gray-700">{report.general_notes}</p>
                </div>
              )}
            </div>

            {/* Events */}
            {events.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Événements</h2>
                
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="mr-4">
                          {getEventIcon(event.event_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-semibold text-gray-900 mr-3">
                              {index + 1}. {event.title}
                            </h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              getSeverityColor(event.severity)
                            }`}>
                              {event.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(event.event_time).toLocaleString('fr-FR')}
                            {event.location && ` • ${event.location}`}
                          </p>
                          {event.description && (
                            <p className="text-gray-700 mb-2">{event.description}</p>
                          )}
                          {event.action_taken && (
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-sm font-medium text-blue-900">Action prise:</p>
                              <p className="text-sm text-blue-800">{event.action_taken}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Photos ({photos.length})
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(photo.url, '_blank')}
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                        <Camera className="w-3 h-3 mr-1" />
                        {photo.filename}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Validation Info */}
            {report.status === 'validated' && report.validated_at && (
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className="font-bold text-green-900">Validé</h3>
                </div>
                <div className="text-sm text-green-800">
                  <p>Par: {report.validator_first_name} {report.validator_last_name}</p>
                  <p className="mt-1">
                    Le: {new Date(report.validated_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            )}

            {/* Site Info */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Site</h3>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-gray-500">Nom:</span>{' '}
                  <span className="font-medium">{report.site_name}</span>
                </p>
                {report.site_address && (
                  <p>
                    <span className="text-gray-500">Adresse:</span>{' '}
                    <span className="font-medium">{report.site_address}</span>
                  </p>
                )}
                {report.site_city && (
                  <p>
                    <span className="text-gray-500">Ville:</span>{' '}
                    <span className="font-medium">{report.site_city}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Métadonnées</h3>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-gray-500">Créé le:</span>{' '}
                  <span className="font-medium">
                    {new Date(report.created_at).toLocaleString('fr-FR')}
                  </span>
                </p>
                {report.updated_at !== report.created_at && (
                  <p>
                    <span className="text-gray-500">Modifié le:</span>{' '}
                    <span className="font-medium">
                      {new Date(report.updated_at).toLocaleString('fr-FR')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReportView