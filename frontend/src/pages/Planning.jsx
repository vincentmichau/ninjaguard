import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { 
  Calendar, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Planning = () => {
  const { user } = useAuth()
  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    fetchPlanning()
  }, [currentMonth])

  const fetchPlanning = async () => {
    try {
      const params = new URLSearchParams()
      params.append('month', currentMonth.getMonth() + 1)
      params.append('year', currentMonth.getFullYear())

      const res = await axios.get(`/api/planning/personal?${params}`)
      setPlanning(res.data)
    } catch (error) {
      toast.error('Erreur lors du chargement du planning')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
  }

  const handleExportICal = async () => {
    try {
      const params = new URLSearchParams()
      params.append('month', currentMonth.getMonth() + 1)
      params.append('year', currentMonth.getFullYear())

      window.location.href = `/api/planning/export/ical?${params}`
      toast.success('Export iCalendar en cours')
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const getShiftsForDay = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return planning.filter(shift => shift.shift_date.startsWith(dateStr))
  }

  const getShiftColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
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
            <h1 className="text-3xl font-bold text-gray-900">Mon Planning</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos quarts de travail
            </p>
          </div>

          <button
            onClick={handleExportICal}
            className="btn-secondary flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter iCal
          </button>
        </div>

        {/* Calendar */}
        <div className="card">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[100px]" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const dayShifts = getShiftsForDay(day)
              const isToday = 
                day === new Date().getDate() &&
                currentMonth.getMonth() === new Date().getMonth() &&
                currentMonth.getFullYear() === new Date().getFullYear()

              return (
                <div
                  key={day}
                  className={`min-h-[100px] border rounded-lg p-2 ${
                    isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`font-semibold mb-1 ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                    {day}
                  </div>

                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`text-xs p-2 rounded mb-1 ${getShiftColor(shift.status)}`}
                    >
                      <div className="font-semibold truncate">{shift.site_name}</div>
                      <div className="flex items-center text-xs mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(shift.shift_start).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Shifts */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Prochains quarts</h3>
          
          {planning.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun quart prévu pour ce mois</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {planning
                .filter(shift => new Date(shift.shift_date) >= new Date())
                .slice(0, 5)
                .map((shift) => (
                  <div key={shift.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-3 rounded-lg mr-4">
                          <Calendar className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{shift.site_name}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Clock className="w-4 h-4 mr-2" />
                            {new Date(shift.shift_date).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                            {' • '}
                            {new Date(shift.shift_start).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            {' - '}
                            {new Date(shift.shift_end).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getShiftColor(shift.status)
                      }`}>
                        {shift.status === 'completed' ? 'Terminé' : 
                         shift.status === 'absent' ? 'Absent' : 'Prévu'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Planning