// import { boot } from 'quasar/wrappers'
import {
  QCalendar,
  QCalendarDay,
  QCalendarAgenda,
  QCalendarMonth,
  QCalendarResource,
  QCalendarScheduler,
  QCalendarTask
} from '@quasar/quasar-ui-qcalendar'

export default ({ app }) => {
  const VuePlugin = {
    install (app, options) {
      app.component(QCalendar.name, QCalendar)
      app.component(QCalendarAgenda.name, QCalendarAgenda)
      app.component(QCalendarDay.name, QCalendarDay)
      app.component(QCalendarMonth.name, QCalendarMonth)
      app.component(QCalendarResource.name, QCalendarResource)
      app.component(QCalendarScheduler.name, QCalendarScheduler)
      app.component(QCalendarTask.name, QCalendarTask)
    }
  }
  app.use(VuePlugin)
}