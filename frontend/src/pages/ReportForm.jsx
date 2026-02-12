import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { 
  Save, 
  Send, 
  Plus, 
  X, 
  Camera, 
  MapPin,
  Clock,
  Thermometer,
  Cloud
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ReportForm = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sites, setSites] = useState([])
  const [events, setEvents] = useState([])
  const [photos, setPhotos] = useState([])

  const [formData, setFormData] = useState({
    site_id: '',
    shift_date: new Date().toISOString().split('T')[0],
    shift_start: '20:00',
    shift_end: '06:00',
    weather: '',
    temperature: '',
    general_notes: ''
  })

  const [eventForm, setEventForm] = useState({
    event_type: 'observation',
    title: '',
    description: '',
    event_time: new Date().toISOString().slice(0, 16),
    location: '',
    severity: 'low',
    action_taken: ''
  })

  useEffect(() => {
    fetchSites()
    if (isEdit) {
      fetchReport()
    }
  }, [id])

  const fetchSites = async () => {
    try {
      const res = await axios.get('/api/admin/sites')
      setSites(res.data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const fetchReport = async () => {
    try {
      setLoading(true)
      const [reportRes, eventsRes, photosRes] = await Promise.all([
        axios.get(`/api/reports/${id}`),
        axios.get(`/api/events/report/${id}`),
        axios.get(`/api/photos/report/${id}`)
      ])

      const report = reportRes.data
      setFormData({
        site_id: report.site_id,
        shift_date: report.shift_date.split('T')[0],
        shift_start: report.shift_start.slice(0, 5),
        shift_end: report.shift_end.slice(0, 5),
        weather: report.weather || '',
        temperature: report.temperature || '',
        general_notes: report.general_notes || ''
      })

      setEvents(eventsRes.data)
      setPhotos(photosRes.data)
    } catch (error) {
      toast.error('Erreur lors du chargement du rapport')
      navigate('/reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (asDraft = true) => {
    try {
      setSubmitting(true)

      const reportData = {
        ...formData,
        shift_start: `${formData.shift_date}T${formData.shift_start}:00`,
        shift_end: `${formData.shift_date}T${formData.shift_end}:00`
      }

      if (isEdit) {
        await axios.put(`/api/reports/${id}`, reportData)
        toast.success('Rapport mis à jour avec succès')
      } else {
        const res = await axios.post('/api/reports', reportData)
        const reportId = res.data.report_id
        await saveEvents(reportId)
        await savePhotos(reportId)
        
        if (!asDraft) {
          await axios.put(`/api/reports/${reportId}/validate`)
          toast.success('Rapport validé avec succès')
        } else {
          toast.success('Rapport enregistré')
        }
        
        navigate('/reports')
        return
      }

      navigate('/reports')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement')
    } finally {
      setSubmitting(false)
    }
  }

  const addEvent = () => {
    if (!eventForm.title) {
      toast.error('Le titre de l\'événement est requis')
      return
    }

    setEvents([...events, { ...eventForm, id: Date.now() }])
    setEventForm({
      event_type: 'observation',
      title: '',
      description: '',
      event_time: new Date().toISOString().slice(0, 16),
      location: '',
      severity: 'low',
      action_taken: ''
    })
  }

  const removeEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId))
  }

  const saveEvents = async (reportId) => {
    for (const event of events) {
      if (event.id < 1000000) continue // Skip already saved events
      
      await axios.post('/api/events', {
        report_id: reportId,
        ...event
      })
    }
  }

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    for (const file of files) {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('report_id', id || 'temp')
      
      try {
        const res = await axios.post('/api/photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        setPhotos([...photos, {
          id: res.data.photo_id,
          url: res.data.url,
          filename: file.name
        }])
      } catch (error) {
        toast.error('Erreur lors de l\'upload de la photo')
      }
    }
  }

  const removePhoto = (photoId) => {
    setPhotos(photos.filter(p => p.id !== photoId))
    if (id) {
      axios.delete(`/api/photos/${photoId}`).catch(console.error)
    }
  }

  const savePhotos = async (reportId) => {
    for (const photo of photos) {
      if (photo.id < 1000000) continue
      
      await axios.post('/api/photos', {
        report_id: reportId,
        filename: photo.filename,
        file_path: photo.url
      })
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Modifier le rapport' : 'Nouveau rapport'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Modifiez les informations du rapport' : 'Créez un nouveau rapport de veille'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informations générales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site
                  </label>
                  <select
                    value={formData.site_id}
                    onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Sélectionner un site</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} - {site.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.shift_date}
                    onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Heure début
                  </label>
                  <input
                    type="time"
                    value={formData.shift_start}
                    onChange={(e) => setFormData({ ...formData, shift_start: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Heure fin
                  </label>
                  <input
                    type="time"
                    value={formData.shift_end}
                    onChange={(e) => setFormData({ ...formData, shift_end: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Cloud className="w-4 h-4 mr-2" />
                    Météo
                  </label>
                  <select
                    value={formData.weather}
                    onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Ensoleillé">Ensoleillé</option>
                    <option value="Nuageux">Nuageux</option>
                    <option value="Pluvieux">Pluvieux</option>
                    <option value="Neige">Neige</option>
                    <option value="Brouillard">Brouillard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Thermometer className="w-4 h-4 mr-2" />
                    Température (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="input-field"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes générales
                </label>
                <textarea
                  value={formData.general_notes}
                  onChange={(e) => setFormData({ ...formData, general_notes: e.target.value })}
                  className="input-field"
                  rows="4"
                  placeholder="Ajoutez vos notes générales ici..."
                />
              </div>
            </div>

            {/* Événements */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Événements</h2>
              
              {/* Event Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={eventForm.event_type}
                      onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                      className="input-field"
                    >
                      <option value="observation">Observation</option>
                      <option value="incident">Incident</option>
                      <option value="round">Ronde</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="input-field"
                      placeholder="Titre de l'événement"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.event_time}
                      onChange={(e) => setEventForm({ ...eventForm, event_time: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Lieu
                    </label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      className="input-field"
                      placeholder="Lieu de l'événement"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sévérité
                    </label>
                    <select
                      value={eventForm.severity}
                      onChange={(e) => setEventForm({ ...eventForm, severity: e.target.value })}
                      className="input-field"
                    >
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Élevée</option>
                      <option value="critical">Critique</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Description de l'événement"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action prise
                  </label>
                  <textarea
                    value={eventForm.action_taken}
                    onChange={(e) => setEventForm({ ...eventForm, action_taken: e.target.value })}
                    className="input-field"
                    rows="2"
                    placeholder="Actions prises suite à l'événement"
                  />
                </div>

                <button
                  type="button"
                  onClick={addEvent}
                  className="mt-4 btn-primary w-full flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter l'événement
                </button>
              </div>

              {/* Events List */}
              {events.length > 0 && (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
                              event.event_type === 'incident' ? 'bg-red-100 text-red-800' :
                              event.event_type === 'observation' ? 'bg-blue-100 text-blue-800' :
                              event.event_type === 'round' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.event_type}
                            </span>
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(event.event_time).toLocaleString('fr-FR')}
                            {event.location && ` • ${event.location}`}
                          </p>
                          {event.description && (
                            <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeEvent(event.id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Photos</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">Cliquez pour ajouter des photos</p>
                  <p className="text-sm text-gray-500">PNG, JPG jusqu'à 10MB</p>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="w-full btn-secondary flex items-center justify-center disabled:opacity-50"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Enregistrer brouillon
                </button>
                
                {user.role !== 'watcher' && (
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="w-full btn-primary flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Valider le rapport
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Veilleur:</strong> {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Date création:</strong> {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReportForm